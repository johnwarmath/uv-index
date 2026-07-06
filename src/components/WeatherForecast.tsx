import { Wind, Thermometer, Flame, Snowflake } from 'lucide-react';
import type { DailyForecast } from '@/lib/weather';

export default function WeatherForecast({
  forecast,
  locationLabel,
}: {
  forecast: DailyForecast[];
  locationLabel: string | null;
}) {
  if (forecast.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--color-border)] p-4 mb-8">
        <p className="text-sm text-[var(--color-paper-dim)]">
          Weather forecast unavailable — add or check the site&apos;s location to enable this.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)]">5-day forecast</p>
        {locationLabel && <p className="text-xs text-[var(--color-paper-dim)]">{locationLabel}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {forecast.map((day, i) => {
          const heatWarning = day.heatIndexMaxF !== null && day.heatIndexMaxF >= 100;
          const coldWarning = day.coldIndexMinF !== null && day.coldIndexMinF <= 20;
          return (
            <div
              key={day.date}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
            >
              <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-2">
                {i === 0
                  ? 'Today'
                  : new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
              </p>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Thermometer size={13} className="text-[var(--color-paper-dim)] shrink-0" />
                <span className="text-sm font-medium">
                  {day.tempMaxF}° / {day.tempMinF}°
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Wind size={13} className="text-[var(--color-paper-dim)] shrink-0" />
                <span className="text-xs text-[var(--color-paper-dim)]">{day.windMaxMph} mph</span>
              </div>
              {day.heatIndexMaxF !== null && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame size={12} className={heatWarning ? 'text-[var(--color-incident-bright)]' : 'text-[var(--color-paper-dim)]'} />
                  <span className={`text-xs ${heatWarning ? 'text-[var(--color-incident-bright)] font-medium' : 'text-[var(--color-paper-dim)]'}`}>
                    {day.heatIndexMaxF}°
                  </span>
                </div>
              )}
              {day.coldIndexMinF !== null && (
                <div className="flex items-center gap-1.5">
                  <Snowflake size={12} className={coldWarning ? 'text-[var(--color-amber)]' : 'text-[var(--color-paper-dim)]'} />
                  <span className={`text-xs ${coldWarning ? 'text-[var(--color-amber)] font-medium' : 'text-[var(--color-paper-dim)]'}`}>
                    {day.coldIndexMinF}°
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
