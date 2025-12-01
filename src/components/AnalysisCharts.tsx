import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, MapPin } from "lucide-react";

// Multi-Factor Analysis Data
const multiFactorData = [
  { factor: 'Source Credibility', score: 85, color: '#3b82f6' },
  { factor: 'Factual Accuracy', score: 78, color: '#10b981' },
  { factor: 'Bias Detection', score: 65, color: '#f59e0b' },
  { factor: 'Emotional Language', score: 72, color: '#8b5cf6' },
  { factor: 'Evidence Quality', score: 88, color: '#06b6d4' },
  { factor: 'Cross-Reference', score: 91, color: '#14b8a6' },
];

// Sentiment Analysis Data
const sentimentData = [
  { category: 'Factual', value: 45, color: '#10b981' },
  { category: 'Opinion', value: 25, color: '#f59e0b' },
  { category: 'Emotional', value: 20, color: '#ef4444' },
  { category: 'Propaganda', value: 10, color: '#dc2626' },
];

// Historical Trend Data
const trendData = [
  { month: 'Jan', articles: 45, misinformation: 12 },
  { month: 'Feb', articles: 52, misinformation: 15 },
  { month: 'Mar', articles: 48, misinformation: 10 },
  { month: 'Apr', articles: 61, misinformation: 18 },
  { month: 'May', articles: 55, misinformation: 14 },
  { month: 'Jun', articles: 67, misinformation: 16 },
];

// Fact Check Comparison Data
const factCheckData = [
  { category: 'Verified Facts', value: 65, color: '#10b981' },
  { category: 'Unverified Claims', value: 25, color: '#f59e0b' },
  { category: 'False Information', value: 10, color: '#ef4444' },
];

export const AnalysisCharts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Multi-Factor Analysis Chart */}
      <Card className="glass-card border-2 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Multi-Factor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={multiFactorData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="factor" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {multiFactorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Language Analysis Pie Chart */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle>Language Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="category"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fact Check Comparison */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle>Fact Check Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={factCheckData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {factCheckData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Historical Trend */}
      <Card className="glass-card border-2 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Historical Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="articles" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Articles"
              />
              <Line 
                type="monotone" 
                dataKey="misinformation" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Misinformation"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart for Credibility Factors */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle>Credibility Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={multiFactorData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Score" 
                dataKey="score" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Geographic Insights (Placeholder) */}
      <Card className="glass-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">United States</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '85%' }} />
                </div>
                <span className="text-sm font-semibold">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">United Kingdom</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '60%' }} />
                </div>
                <span className="text-sm font-semibold">60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Canada</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '45%' }} />
                </div>
                <span className="text-sm font-semibold">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Australia</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '38%' }} />
                </div>
                <span className="text-sm font-semibold">38%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Germany</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '32%' }} />
                </div>
                <span className="text-sm font-semibold">32%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Based on sharing patterns and engagement metrics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};