package expo.modules.alarmengine

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

private const val TAG = "AlarmEngine"

/**
 * Programa con AlarmManager.setAlarmClock: es la misma API que usa el Reloj
 * del sistema. Dispara exacto aunque el teléfono esté en Doze, y Android
 * permite arrancar un servicio en primer plano desde su broadcast (algo que
 * una notificación programada común no puede hacer).
 */
object AlarmScheduler {
  const val EXTRA_ENTRY_ID = "expo.modules.alarmengine.ENTRY_ID"

  private fun alarmManager(context: Context) =
    context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

  private fun firePendingIntent(context: Context, id: String, flags: Int): PendingIntent? {
    val intent = Intent(context, AlarmReceiver::class.java)
      .setAction("expo.modules.alarmengine.FIRE.$id")
      .putExtra(EXTRA_ENTRY_ID, id)
    return PendingIntent.getBroadcast(
      context,
      id.hashCode(),
      intent,
      flags or PendingIntent.FLAG_IMMUTABLE
    )
  }

  /** Lo que se abre al tocar el ícono de alarma de la barra de estado. */
  private fun showPendingIntent(context: Context): PendingIntent? {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
    return PendingIntent.getActivity(
      context,
      0,
      launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  fun canScheduleExact(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager(context).canScheduleExactAlarms()

  fun schedule(context: Context, entry: AlarmEntry) {
    if (entry.triggerAtMs <= System.currentTimeMillis()) return
    val operation = firePendingIntent(context, entry.id, PendingIntent.FLAG_UPDATE_CURRENT) ?: return
    val manager = alarmManager(context)

    try {
      if (canScheduleExact(context)) {
        manager.setAlarmClock(
          AlarmManager.AlarmClockInfo(entry.triggerAtMs, showPendingIntent(context)),
          operation
        )
      } else {
        // Sin permiso de alarma exacta (no debería pasar con USE_EXACT_ALARM):
        // mejor sonar con unos minutos de desvío que no sonar.
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, entry.triggerAtMs, operation)
      }
      AlarmStore.putScheduled(context, entry)
    } catch (e: SecurityException) {
      Log.w(TAG, "No se pudo programar la alarma ${entry.id}", e)
    }
  }

  fun cancelAll(context: Context) {
    val manager = alarmManager(context)
    for (entry in AlarmStore.getScheduled(context)) {
      firePendingIntent(context, entry.id, PendingIntent.FLAG_NO_CREATE)?.let {
        manager.cancel(it)
        it.cancel()
      }
    }
    AlarmStore.clearScheduled(context)
  }

  /** Tras reiniciar el teléfono o actualizar la app, AlarmManager queda vacío. */
  fun rescheduleAll(context: Context) {
    val now = System.currentTimeMillis()
    for (entry in AlarmStore.getScheduled(context)) {
      if (entry.triggerAtMs > now) {
        schedule(context, entry)
      } else {
        AlarmStore.removeScheduled(context, entry.id)
      }
    }
  }
}
