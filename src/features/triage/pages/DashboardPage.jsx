import { CaseQueue } from '../components/CaseQueue'
import { Activity, Clock, ShieldAlert, CheckSquare } from 'lucide-react'

// Brutalist Stat Card
const StatCard = ({ title, value, icon, color = 'primary' }) => {
  const isRed = color === 'red'
  const isGreen = color === 'green'
  
  const borderClass = isRed ? 'border-[#DC2626]' : isGreen ? 'border-[#16A34A]' : 'border-primary'
  const textClass = isRed ? 'text-[#DC2626]' : isGreen ? 'text-[#16A34A]' : 'text-primary'

  return (
    <div className={`
      bg-surface border p-6 flex flex-col justify-between 
      ${borderClass} shadow-brutal hover:-translate-y-1 transition-transform
    `}>
      <div className="flex justify-between items-start mb-4">
        <span className="font-mono-technical text-[10px] opacity-60 uppercase">{title}</span>
        <div className={`${textClass} opacity-80`}>
          {icon}
        </div>
      </div>
      <div>
        <span className={`text-4xl font-black font-mono-technical ${textClass}`}>{value}</span>
      </div>
    </div>
  )
}

export const DashboardPage = () => {
  // Using Mock Data summaries for now
  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-primary pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
            GOOD MORNING,<br />DR. SHARMA.
          </h2>
          <p className="mt-4 font-mono-technical text-sm opacity-80 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#DC2626] inline-block animate-pulse"></span>
            YOU HAVE 3 URGENT CASES REQUIRING REVIEW
          </p>
        </div>
        <div className="mt-6 md:mt-0 font-mono-technical text-xs border border-primary px-4 py-2 bg-on-primary">
          LOGGED IN AT: 08:34 AM
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <StatCard title="TOTAL TODAY" value="24" icon={<Activity />} />
        <StatCard title="HIGH RISK" value="3" icon={<ShieldAlert />} color="red" />
        <StatCard title="REVIEWED" value="18" icon={<CheckSquare />} color="green" />
        <StatCard title="AVG TRIAGE TIME" value="4.2m" icon={<Clock />} />
      </div>

      {/* Case Queue Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8 border-b border-primary pb-4">
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            LIVE PATIENT QUEUE
          </h3>
          <span className="font-mono-technical text-xs opacity-60">AUTO-REFRESH: ON</span>
        </div>
        
        <CaseQueue />
      </div>
    </div>
  )
}
