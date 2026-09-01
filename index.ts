import Constants from 'expo-constants';

import 'expo-router/entry';

// El widget nativo no existe en Expo Go (necesita dev/standalone build).
// Igual que con expo-notifications, ni siquiera se importa la librería ahí
// para no repetir el mismo tipo de crash por import estático.
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { widgetTaskHandler } = require('./src/widgets/widget-task-handler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
