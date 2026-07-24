import { CloudSun, Thermometer, Wind } from "lucide-react";

interface WeatherData { city: string; weather: string; tempLow: number; tempHigh: number; wind: string; }
interface WeatherGridProps { weatherData: WeatherData[]; }

export default function WeatherGrid({ weatherData }: WeatherGridProps) {
  if (weatherData.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><CloudSun className="h-4 w-4 text-accent" />核心负荷区天气</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {weatherData.map((weather, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-sm">
            <div className="mb-3 flex items-center justify-between"><h5 className="font-semibold text-foreground">{weather.city}</h5><span className="text-sm text-muted-foreground">{weather.weather}</span></div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-foreground/80">{weather.tempLow}°C ~ {weather.tempHigh}°C</span></div>
              <div className="flex items-center gap-1.5"><Wind className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-foreground/80">{weather.wind}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
