package expo.modules.alarmengine

import android.app.Activity
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AlarmEngineModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("AlarmEngine")

    Events("onRing")

    OnCreate {
      AlarmService.onRingListener = { ringing ->
        sendEvent("onRing", mapOf("alarmId" to ringing.alarmId, "occurrenceIso" to ringing.occurrenceIso))
      }
    }

    OnDestroy {
      AlarmService.onRingListener = null
    }

    Function("scheduleAlarm") { id: String, triggerAtMs: Double, title: String, body: String,
      soundUri: String?, alarmId: String, occurrenceIso: String ->
      AlarmScheduler.schedule(
        context,
        AlarmEntry(id, triggerAtMs.toLong(), title, body, soundUri, alarmId, occurrenceIso)
      )
    }

    Function("cancelAll") {
      AlarmScheduler.cancelAll(context)
    }

    Function("getRingingAlarm") {
      AlarmStore.getRinging(context)?.let {
        mapOf("alarmId" to it.alarmId, "occurrenceIso" to it.occurrenceIso)
      }
    }

    Function("stopRinging") {
      AlarmService.stop(context)
      appContext.currentActivity?.let { activity ->
        activity.runOnUiThread { AlarmLockScreen.apply(activity, false) }
      }
    }

    Function("canScheduleExactAlarms") {
      AlarmScheduler.canScheduleExact(context)
    }

    Function("canUseFullScreenIntent") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).canUseFullScreenIntent()
      } else {
        true
      }
    }
  }
}

/** Mostrar la app por encima de la pantalla bloqueada solo mientras suena una alarma. */
object AlarmLockScreen {
  fun apply(activity: Activity, show: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setShowWhenLocked(show)
      activity.setTurnScreenOn(show)
    }
  }
}
