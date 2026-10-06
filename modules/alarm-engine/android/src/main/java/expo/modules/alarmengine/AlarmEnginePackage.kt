package expo.modules.alarmengine

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.util.Log
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

private const val TAG = "AlarmEngine"

class AlarmEnginePackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> {
    return listOf(AlarmActivityLifecycleListener())
  }
}

/**
 * La notificación de pantalla completa abre MainActivity. Para que se vea
 * sobre la pantalla bloqueada (y la prenda) hay que marcarla antes de que se
 * muestre, así que no alcanza con hacerlo desde el JS: se decide acá según
 * haya o no una alarma sonando.
 */
class AlarmActivityLifecycleListener : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) = applyLockScreenState(activity)

  override fun onResume(activity: Activity) = applyLockScreenState(activity)

  private fun applyLockScreenState(activity: Activity) {
    // Corre en cada apertura/resume de la app: si esto tirara una excepción
    // sin atajar, la app dejaría de abrir siempre, no solo mientras suena la
    // alarma.
    try {
      AlarmLockScreen.apply(activity, AlarmStore.getRinging(activity) != null)
    } catch (e: Exception) {
      Log.e(TAG, "Fallo aplicando el estado de pantalla bloqueada", e)
    }
  }
}
