export interface DailyForecast {
  date: string;
  tempMaxF: number;
  tempMinF: number;
  windMaxMph: number;
  heatIndexMaxF: number | null;
  coldIndexMinF: number | null;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Converts a free-text location (e.g. "Pecos County, TX") into coordinates
 * using Open-Meteo's free geocoding API (no API key required).
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      { next: { revalidate: 86400 } } // location text rarely changes; cache for a day
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return null;

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      displayName: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
    };
  } catch {
    return null;
  }
}

/**
 * Fetches a 5-day forecast (high/low temp, max wind, heat/cold index) using
 * Open-Meteo's free forecast API (no API key required).
 */
export async function getForecast(latitude: number, longitude: number): Promise<DailyForecast[]> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=5`,
      { next: { revalidate: 1800 } } // refresh every 30 minutes
    );
    if (!res.ok) return [];
    const data = await res.json();
    const daily = data?.daily;
    if (!daily?.time) return [];

    return daily.time.map((date: string, i: number) => ({
      date,
      tempMaxF: Math.round(daily.temperature_2m_max[i]),
      tempMinF: Math.round(daily.temperature_2m_min[i]),
      windMaxMph: Math.round(daily.wind_speed_10m_max[i]),
      heatIndexMaxF:
        daily.apparent_temperature_max[i] != null ? Math.round(daily.apparent_temperature_max[i]) : null,
      coldIndexMinF:
        daily.apparent_temperature_min[i] != null ? Math.round(daily.apparent_temperature_min[i]) : null,
    }));
  } catch {
    return [];
  }
}
