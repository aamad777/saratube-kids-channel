import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScreenTimeChartProps {
  childId: string;
  childName: string;
}

interface DailyData {
  date: string;
  day: string;
  minutes: number;
}

const ScreenTimeChart = ({ childId, childName }: ScreenTimeChartProps) => {
  const [weekData, setWeekData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [trend, setTrend] = useState<"up" | "down" | "same">("same");

  useEffect(() => {
    fetchWeeklyData();
  }, [childId]);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      // Get last 7 days
      const dates: string[] = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      const { data, error } = await supabase
        .from("daily_watch_time")
        .select("watch_date, total_seconds")
        .eq("user_id", childId)
        .in("watch_date", dates);

      if (error) throw error;

      // Map data to chart format
      const chartData: DailyData[] = dates.map((dateStr) => {
        const dayOfWeek = new Date(dateStr).getDay();
        const record = data?.find((d) => d.watch_date === dateStr);
        const minutes = record ? Math.round((record.total_seconds || 0) / 60) : 0;
        
        return {
          date: dateStr,
          day: dayNames[dayOfWeek],
          minutes,
        };
      });

      setWeekData(chartData);

      // Calculate today's minutes
      const today = new Date().toISOString().split("T")[0];
      const todayData = chartData.find((d) => d.date === today);
      setTodayMinutes(todayData?.minutes || 0);

      // Calculate weekly average
      const totalMinutes = chartData.reduce((sum, d) => sum + d.minutes, 0);
      const avg = Math.round(totalMinutes / 7);
      setWeeklyAverage(avg);

      // Calculate trend (compare last 3 days vs previous 3 days)
      const last3 = chartData.slice(-3).reduce((sum, d) => sum + d.minutes, 0);
      const prev3 = chartData.slice(1, 4).reduce((sum, d) => sum + d.minutes, 0);
      if (last3 > prev3 * 1.1) setTrend("up");
      else if (last3 < prev3 * 0.9) setTrend("down");
      else setTrend("same");

    } catch (error) {
      console.error("Error fetching weekly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remaining = mins % 60;
      return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 60);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-8 text-center">
          <Clock className="w-8 h-8 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          {childName}'s Screen Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-xl">
            <p className="text-2xl font-bold text-primary">{formatMinutes(todayMinutes)}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xl">
            <p className="text-2xl font-bold">{formatMinutes(weeklyAverage)}</p>
            <p className="text-xs text-muted-foreground">Daily Avg</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xl flex flex-col items-center justify-center">
            {trend === "up" ? (
              <>
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <p className="text-xs text-muted-foreground">Trending Up</p>
              </>
            ) : trend === "down" ? (
              <>
                <TrendingDown className="w-6 h-6 text-green-500" />
                <p className="text-xs text-muted-foreground">Trending Down</p>
              </>
            ) : (
              <>
                <Minus className="w-6 h-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Steady</p>
              </>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}m`}
                domain={[0, maxMinutes]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyData;
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg px-3 py-2">
                        <p className="font-medium">{data.day}</p>
                        <p className="text-sm text-primary">{formatMinutes(data.minutes)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {weekData.map((entry, index) => {
                  const isToday = entry.date === new Date().toISOString().split("T")[0];
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isToday ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} 
                      fillOpacity={isToday ? 1 : 0.3}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted-foreground/30" />
            <span>Previous Days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreenTimeChart;
