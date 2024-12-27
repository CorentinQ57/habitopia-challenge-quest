import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HourlyActivityProps {
  data: Array<{
    hour: number;
    count: number;
  }>;
}

export const HourlyActivity = ({ data }: HourlyActivityProps) => {
  return (
    <Card className="backdrop-blur-sm lg:col-span-2">
      <CardHeader>
        <CardTitle>Activité par Heure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}h`}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} habitudes`, 'Complétées']}
                labelFormatter={(hour) => `${hour}h00`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#9b87f5" 
                strokeWidth={2}
                dot={{ fill: '#9b87f5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};