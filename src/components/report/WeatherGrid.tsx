import { CloudSun, Thermometer, Droplets, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  city: string;
  weather: string;
  tempLow: number;
  tempHigh: number;
  wind: string;
}

interface WeatherGridProps {
  weatherData: WeatherData[];
}

export default function WeatherGrid({ weatherData }: WeatherGridProps) {
  if (weatherData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <CloudSun className="h-4 w-4" />
        核心负荷区天气
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {weatherData.map((weather, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
          >
            <div className="mb-3 flex items-center justify-between">
              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                {weather.city}
              </h5>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {weather.weather}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {weather.tempLow}°C - {weather.tempHigh}°C
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {weather.wind}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}