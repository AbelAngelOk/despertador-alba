'use no memo';

import React from 'react';
import { FlexWidget, HexColor, OverlapWidget, TextWidget } from 'react-native-android-widget';

import { SkyWidgetData } from './widgetData';

const BAND_COUNT = 10;

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): HexColor {
  const toHex = (channel: number) => Math.round(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Los widgets de Android (RemoteViews) no soportan fondos con gradiente real,
 * así que se aproxima apilando N franjas de color sólido interpoladas entre
 * el color de arriba y el de abajo del cielo actual.
 */
function bandColors(top: string, bottom: string, count: number): HexColor[] {
  const a = hexToRgb(top);
  const b = hexToRgb(bottom);
  const colors: HexColor[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    colors.push(
      rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t])
    );
  }
  return colors;
}

interface SkyClockWidgetProps {
  data: SkyWidgetData;
}

export function SkyClockWidget({ data }: SkyClockWidgetProps) {
  const bands = bandColors(data.topColor, data.bottomColor, BAND_COUNT);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ height: 'match_parent', width: 'match_parent', borderRadius: 20, overflow: 'hidden' }}
    >
      <OverlapWidget style={{ height: 'match_parent', width: 'match_parent' }}>
        <FlexWidget
          style={{ height: 'match_parent', width: 'match_parent', flexDirection: 'column' }}
        >
          {bands.map((color, index) => (
            <FlexWidget
              key={index}
              style={{ flex: 1, width: 'match_parent', backgroundColor: color }}
            />
          ))}
        </FlexWidget>

        <FlexWidget
          style={{
            height: 'match_parent',
            width: 'match_parent',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 12,
          }}
        >
          <TextWidget
            text={data.hasLocation ? `${data.phaseLabel} · ${data.degrees}°` : 'Configurá tu ubicación'}
            style={{ fontSize: 11, color: '#D8D4C8' }}
          />

          {data.nextAlarmTime ? (
            <FlexWidget style={{ flexDirection: 'column' }}>
              <TextWidget text="Próxima alarma" style={{ fontSize: 9, color: '#C4C0B4' }} />
              <TextWidget
                text={data.nextAlarmTime}
                style={{ fontSize: 26, color: '#F6F1E7', fontWeight: 'bold' }}
              />
              <TextWidget
                text={data.nextAlarmCountdown ?? ''}
                style={{ fontSize: 10, color: '#FF9B54' }}
              />
            </FlexWidget>
          ) : (
            <TextWidget text="Sin alarmas activas" style={{ fontSize: 11, color: '#C4C0B4' }} />
          )}
        </FlexWidget>
      </OverlapWidget>
    </FlexWidget>
  );
}
