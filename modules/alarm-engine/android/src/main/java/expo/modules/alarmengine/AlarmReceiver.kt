package expo.modules.alarmengine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat

private const val TAG = "AlarmEngine"

/** Recibe el disparo de AlarmManager y arranca el servicio que hace sonar la alarma. */
class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    try {
      val id = intent.getStringExtra(AlarmScheduler.EXTRA_ENTRY_ID) ?: return
      val entry = AlarmStore.getScheduled(context).firstOrNull { it.id == id } ?: return
      AlarmStore.removeScheduled(context, id)

      val serviceIntent = Intent(context, AlarmService::class.java)
        .setAction(AlarmService.ACTION_START)
        .putExtra(AlarmService.EXTRA_ENTRY, entry.toJson().toString())
      ContextCompat.startForegroundService(context, serviceIntent)
    } catch (e: Exception) {
      // Un BroadcastReceiver corre en el proceso de la app: una excepción acá
      // sin atajar tumba toda la app (incluida cualquier Activity abierta).
      Log.e(TAG, "Fallo procesando el disparo de la alarma", e)
    }
  }
}

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED && intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) {
      return
    }
    try {
      AlarmScheduler.rescheduleAll(context)
    } catch (e: Exception) {
      Log.e(TAG, "Fallo reprogramando alarmas", e)
    }
  }
}
