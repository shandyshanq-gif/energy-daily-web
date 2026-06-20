import { cn } from "@/lib/utils";
import type { WeatherData } from "@/lib/markdown";

interface WeatherGridProps {
  weatherData: WeatherData[];
}

function getWeatherCardBg(weather: string): string {
  // Choose a subtle background gradient based on weather
  if (weather.includes("☀") || weather.includes("晴"))
    return "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20";
  if (weather.includes("🌤") || weather.includes("多云"))
    return "bg-gradient-to-br from-sky-50 to-gray-50 dark:from-sky-950/20 dark:to-gray-950/20";
  if (weather.includes("🌧") || weather.includes("雨"))
    return "bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20";
  if (weather.includes("🌨") || weather.includes("雪"))
    return "bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-950/20";
  if (weather.includes("🌫") || weather.includes("雾") || weather.includes("霾"))
    return "bg-gradient-to-br from-gray-50 to-stone-50 dark:from-gray-950/20 dark:to-stone-950/20";
  return "bg-white dark:bg-gray-900";
}

export default function WeatherGrid({ weatherData }: WeatherGridProps) {
  if (weatherData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        暂无天气数据
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {weatherData.map((city, idx) => {
        const isHot = city.tempHigh >= 33;

        return (
          <div
            key={idx}
            className={cn(
              "rounded-xl border border-gray-100 p-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700",
              getWeatherCardBg(city.weather)
            )}
          >
            {/* City name */}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {city.city}
            </p>

            {/* Weather emoji */}
            <div className="my-2 text-center text-2xl">{city.weather}</div>

            {/* Temperature */}
            <div className="text-center">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isHot
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-900 dark:text-gray-100"
                )}
              >
                {city.tempHigh}°
              </span>
              <span className="mx-1 text-xs text-gray-400">/</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {city.tempLow}°
              </span>
            </div>

            {/* Wind */}
            <p className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
              {city.wind}
            </p>
          </div>
        );
      })}
    </div>
  );
}
