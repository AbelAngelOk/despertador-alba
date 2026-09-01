import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { SkyClockWidget } from './sky-clock-widget';
import { computeSkyWidgetData } from './widgetData';

const nameToWidget = {
  SkyClock: SkyClockWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const Widget = nameToWidget[props.widgetInfo.widgetName as keyof typeof nameToWidget];
  if (!Widget) return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await computeSkyWidgetData();
      props.renderWidget(<Widget data={data} />);
      break;
    }
    default:
      break;
  }
}
