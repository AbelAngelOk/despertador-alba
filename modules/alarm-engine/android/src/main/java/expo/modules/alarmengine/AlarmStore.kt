package expo.modules.alarmengine

import android.content.Context
import org.json.JSONObject

/** Una alarma programada en AlarmManager. `id` identifica el PendingIntent. */
data class AlarmEntry(
  val id: String,
  val triggerAtMs: Long,
  val title: String,
  val body: String,
  val soundUri: String?,
  val alarmId: String,
  val occurrenceIso: String
) {
  fun toJson(): JSONObject = JSONObject()
    .put("id", id)
    .put("triggerAtMs", triggerAtMs)
    .put("title", title)
    .put("body", body)
    .put("soundUri", soundUri ?: JSONObject.NULL)
    .put("alarmId", alarmId)
    .put("occurrenceIso", occurrenceIso)

  companion object {
    fun fromJson(json: JSONObject) = AlarmEntry(
      id = json.getString("id"),
      triggerAtMs = json.getLong("triggerAtMs"),
      title = json.getString("title"),
      body = json.getString("body"),
      soundUri = if (json.isNull("soundUri")) null else json.getString("soundUri"),
      alarmId = json.getString("alarmId"),
      occurrenceIso = json.getString("occurrenceIso")
    )
  }
}

data class RingingAlarm(val alarmId: String, val occurrenceIso: String)

/**
 * Persistencia en SharedPreferences: AlarmManager se vacía al reiniciar el
 * teléfono, así que BootReceiver necesita saber qué volver a programar sin
 * depender de que la app (el JS) se abra. También guarda qué alarma está
 * sonando, para que el JS la encuentre al abrirse desde la notificación.
 */
object AlarmStore {
  private const val PREFS = "expo.modules.alarmengine"
  private const val KEY_SCHEDULED = "scheduled"
  private const val KEY_RINGING_ALARM_ID = "ringingAlarmId"
  private const val KEY_RINGING_OCCURRENCE = "ringingOccurrenceIso"
  private const val KEY_RINGING_STARTED_AT = "ringingStartedAtMs"

  // Igual a la ventana en la que el JS considera que una alarma sigue sonando
  // (MAX_RINGS * SNOOZE_INTERVAL_MIN en alarmNotifications.ts). Si el proceso
  // muere mientras suena (el sistema lo mata, un crash, batería) el flag de
  // "está sonando" queda escrito en SharedPreferences y nada vuelve a
  // limpiarlo — sin este margen quedaría atascado para siempre y la app
  // abriría directo a la pantalla de alarma en cada apertura.
  const val RING_TIMEOUT_MS = 15 * 60_000L
  private const val STALE_GRACE_MS = 60_000L

  private fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  @Synchronized
  fun getScheduled(context: Context): List<AlarmEntry> {
    val raw = prefs(context).getString(KEY_SCHEDULED, null) ?: return emptyList()
    val json = JSONObject(raw)
    return json.keys().asSequence().map { AlarmEntry.fromJson(json.getJSONObject(it)) }.toList()
  }

  @Synchronized
  fun putScheduled(context: Context, entry: AlarmEntry) {
    val json = JSONObject(prefs(context).getString(KEY_SCHEDULED, null) ?: "{}")
    json.put(entry.id, entry.toJson())
    prefs(context).edit().putString(KEY_SCHEDULED, json.toString()).apply()
  }

  @Synchronized
  fun removeScheduled(context: Context, id: String) {
    val json = JSONObject(prefs(context).getString(KEY_SCHEDULED, null) ?: "{}")
    json.remove(id)
    prefs(context).edit().putString(KEY_SCHEDULED, json.toString()).apply()
  }

  @Synchronized
  fun clearScheduled(context: Context) {
    prefs(context).edit().remove(KEY_SCHEDULED).apply()
  }

  @Synchronized
  fun getRinging(context: Context): RingingAlarm? {
    val prefs = prefs(context)
    val alarmId = prefs.getString(KEY_RINGING_ALARM_ID, null) ?: return null
    val occurrenceIso = prefs.getString(KEY_RINGING_OCCURRENCE, null) ?: return null
    val startedAt = prefs.getLong(KEY_RINGING_STARTED_AT, 0L)
    if (startedAt != 0L && System.currentTimeMillis() - startedAt > RING_TIMEOUT_MS + STALE_GRACE_MS) {
      // El servicio que la hacía sonar ya no existe (se lo mató el sistema, un
      // crash): auto-limpiar en vez de dejar la app entrando siempre a esta
      // pantalla.
      setRinging(context, null)
      return null
    }
    return RingingAlarm(alarmId, occurrenceIso)
  }

  @Synchronized
  fun setRinging(context: Context, ringing: RingingAlarm?) {
    val editor = prefs(context).edit()
    if (ringing == null) {
      editor.remove(KEY_RINGING_ALARM_ID).remove(KEY_RINGING_OCCURRENCE).remove(KEY_RINGING_STARTED_AT)
    } else {
      editor.putString(KEY_RINGING_ALARM_ID, ringing.alarmId)
        .putString(KEY_RINGING_OCCURRENCE, ringing.occurrenceIso)
        .putLong(KEY_RINGING_STARTED_AT, System.currentTimeMillis())
    }
    // commit (no apply): el JS puede preguntar apenas arranca la app.
    editor.commit()
  }
}
