package expo.modules.alarmengine

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import org.json.JSONObject

private const val TAG = "AlarmEngine"

/**
 * Servicio en primer plano que hace sonar la alarma con la app cerrada:
 * reproduce el sonido en loop por el stream de ALARMA (respeta el volumen de
 * alarma, no el de multimedia), vibra, y muestra una notificación de
 * pantalla completa que abre la app en la pantalla "alarma sonando". Sigue
 * sonando hasta que el JS llama a stopRinging (el usuario tocó "Apagar") o
 * hasta RING_TIMEOUT_MS.
 */
class AlarmService : Service() {
  companion object {
    const val ACTION_START = "expo.modules.alarmengine.START"
    const val ACTION_STOP = "expo.modules.alarmengine.STOP"
    const val EXTRA_ENTRY = "expo.modules.alarmengine.ENTRY"
    const val EXTRA_FROM_ALARM = "expo.modules.alarmengine.FROM_ALARM"

    private const val CHANNEL_ID = "alarm-engine-ringing"
    private const val NOTIFICATION_ID = 7301
    private const val RING_TIMEOUT_MS = AlarmStore.RING_TIMEOUT_MS
    private val VIBRATION_PATTERN = longArrayOf(0, 600, 600)

    /** Lo setea AlarmEngineModule mientras el JS está vivo, para avisarle al instante. */
    @Volatile
    var onRingListener: ((RingingAlarm) -> Unit)? = null

    fun stop(context: Context) {
      AlarmStore.setRinging(context, null)
      try {
        context.startService(Intent(context, AlarmService::class.java).setAction(ACTION_STOP))
      } catch (e: IllegalStateException) {
        // App en segundo plano sin el servicio vivo: no hay nada sonando que cortar.
        Log.w(TAG, "No se pudo enviar STOP al servicio", e)
      }
    }
  }

  private var player: MediaPlayer? = null
  private var vibrator: Vibrator? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var focusRequest: AudioFocusRequest? = null
  private val handler = Handler(Looper.getMainLooper())
  private val timeout = Runnable { stopRinging() }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    try {
      when (intent?.action) {
        ACTION_START -> {
          val raw = intent.getStringExtra(EXTRA_ENTRY)
          val entry = raw?.let { AlarmEntry.fromJson(JSONObject(it)) }
          if (entry == null) {
            stopSelf()
            return START_NOT_STICKY
          }
          startRinging(entry)
        }
        ACTION_STOP -> stopRinging()
        else -> stopSelf()
      }
    } catch (e: Exception) {
      // Nunca dejar que un fallo acá tumbe el proceso entero (se lo comparte
      // con la Activity): mejor una alarma que no suena que una app que
      // después no abre. Como mínimo, limpiar el flag de "sonando".
      Log.e(TAG, "Fallo arrancando/deteniendo la alarma", e)
      AlarmStore.setRinging(this, null)
      stopSelf()
    }
    return START_NOT_STICKY
  }

  private fun startRinging(entry: AlarmEntry) {
    // Primero startForeground: Android da ~5 s desde startForegroundService.
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
    } else {
      0
    }
    ServiceCompat.startForeground(this, NOTIFICATION_ID, buildNotification(entry), type)

    releasePlayback()
    val ringing = RingingAlarm(entry.alarmId, entry.occurrenceIso)
    AlarmStore.setRinging(this, ringing)

    acquireWakeLock()
    requestAudioFocus()
    startSound(entry.soundUri)
    startVibration()

    handler.removeCallbacks(timeout)
    handler.postDelayed(timeout, RING_TIMEOUT_MS)

    onRingListener?.invoke(ringing)
  }

  private fun stopRinging() {
    handler.removeCallbacks(timeout)
    releasePlayback()
    AlarmStore.setRinging(this, null)
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  override fun onDestroy() {
    handler.removeCallbacks(timeout)
    releasePlayback()
    super.onDestroy()
  }

  private val alarmAudioAttributes: AudioAttributes =
    AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

  private fun startSound(soundUri: String?) {
    val candidates = listOfNotNull(
      soundUri?.let { Uri.parse(it) },
      RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
      RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
    )
    for (uri in candidates) {
      try {
        player = MediaPlayer().apply {
          setAudioAttributes(alarmAudioAttributes)
          setDataSource(this@AlarmService, uri)
          isLooping = true
          prepare()
          start()
        }
        return
      } catch (e: Exception) {
        Log.w(TAG, "No se pudo reproducir $uri, pruebo el siguiente", e)
        player?.release()
        player = null
      }
    }
  }

  private fun startVibration() {
    val vib = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    if (!vib.hasVibrator()) return
    vibrator = vib
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      @Suppress("DEPRECATION")
      vib.vibrate(VIBRATION_PATTERN, 0)
      return
    }
    val effect = VibrationEffect.createWaveform(VIBRATION_PATTERN, 0)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      vib.vibrate(effect, VibrationAttributes.createForUsage(VibrationAttributes.USAGE_ALARM))
    } else {
      @Suppress("DEPRECATION")
      vib.vibrate(effect, alarmAudioAttributes)
    }
  }

  private fun requestAudioFocus() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
      .setAudioAttributes(alarmAudioAttributes)
      .build()
    audioManager.requestAudioFocus(request)
    focusRequest = request
  }

  private fun acquireWakeLock() {
    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlarmEngine:ringing").apply {
      acquire(RING_TIMEOUT_MS + 60_000L)
    }
  }

  private fun releasePlayback() {
    player?.run {
      try {
        stop()
      } catch (_: IllegalStateException) {
      }
      release()
    }
    player = null
    vibrator?.cancel()
    vibrator = null
    focusRequest?.takeIf { Build.VERSION.SDK_INT >= Build.VERSION_CODES.O }?.let {
      (getSystemService(Context.AUDIO_SERVICE) as AudioManager).abandonAudioFocusRequest(it)
    }
    focusRequest = null
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  private fun buildNotification(entry: AlarmEntry): Notification {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
      manager.getNotificationChannel(CHANNEL_ID) == null
    ) {
      val channel = NotificationChannel(CHANNEL_ID, "Alarma sonando", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "La alarma que está sonando ahora"
        // El sonido y la vibración los maneja este servicio, no el canal.
        setSound(null, null)
        enableVibration(false)
        setBypassDnd(true)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      }
      manager.createNotificationChannel(channel)
    }

    val openApp = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      putExtra(EXTRA_FROM_ALARM, true)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    val contentIntent = openApp?.let {
      PendingIntent.getActivity(
        this,
        NOTIFICATION_ID,
        it,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(entry.title)
      .setContentText(entry.body)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setContentIntent(contentIntent)
      .setFullScreenIntent(contentIntent, true)
      .build()
  }
}
