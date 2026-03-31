import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const MOCK_TRAFFIC_DATA = [
  { time: '00:00', high: 2, medium: 4, low: 10 },
  { time: '04:00', high: 1, medium: 2, low: 5 },
  { time: '08:00', high: 5, medium: 12, low: 20 },
  { time: '12:00', high: 8, medium: 18, low: 25 },
  { time: '16:00', high: 6, medium: 15, low: 22 },
  { time: '20:00', high: 4, medium: 8, low: 15 },
]

const MOCK_ACCURACY_DATA = [
  { day: 'Mon', accuracy: 92 },
  { day: 'Tue', accuracy: 94 },
  { day: 'Wed', accuracy: 91 },
  { day: 'Thu', accuracy: 95 },
  { day: 'Fri', accuracy: 96 },
  { day: 'Sat', accuracy: 93 },
  { day: 'Sun', accuracy: 98 },
]

export const AnalyticsPage = () => {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-12 border-b border-primary pb-8">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          SYSTEM INTELLIGENCE
        </h2>
        <div className="font-mono-technical text-xs border border-primary px-3 py-1 bg-surface-container hidden md:block">
          DATA SYNC: REALTIME
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Box 1: Triage Volume */}
        <div className="border border-primary bg-surface p-6 shadow-brutal flex flex-col h-96">
          <div className="flex justify-between items-center border-b border-primary pb-2 mb-6">
            <h3 className="font-mono-technical font-bold">TRIAGE VOLUME BY RISK (24H)</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="time" tick={{ fontFamily: 'Space Grotesk', fontSize: 10 }} stroke="var(--color-primary)" />
                <YAxis tick={{ fontFamily: 'Space Grotesk', fontSize: 10 }} stroke="var(--color-primary)" />
                <Tooltip 
                  cursor={{ fill: 'rgba(26,26,255,0.05)' }} 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface-container)', 
                    border: '1px solid var(--color-primary)',
                    borderRadius: 0,
                    fontFamily: 'Space Grotesk',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="low" stackId="a" fill="#16A34A" />
                <Bar dataKey="medium" stackId="a" fill="#F59E0B" />
                <Bar dataKey="high" stackId="a" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Box 2: AI Accuracy Trend */}
        <div className="border border-primary bg-surface p-6 shadow-brutal flex flex-col h-96">
          <div className="flex justify-between items-center border-b border-primary pb-2 mb-6">
            <h3 className="font-mono-technical font-bold">AI TRIAGE ACCURACY vs DOCTOR OVERRIDE</h3>
            <span className="text-[10px] font-mono-technical animate-pulse">AVG 94.1%</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ACCURACY_DATA}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="day" tick={{ fontFamily: 'Space Grotesk', fontSize: 10 }} stroke="var(--color-primary)" />
                <YAxis domain={['dataMin - 5', 100]} tick={{ fontFamily: 'Space Grotesk', fontSize: 10 }} stroke="var(--color-primary)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 0,
                    fontFamily: 'Space Grotesk',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="accuracy" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
