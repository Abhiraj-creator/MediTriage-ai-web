import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Cell, RadialBarChart, RadialBar, Legend 
} from 'recharts'
import { analyticsService } from '../services/analytics.service'
import { Activity, CheckCircle, Clock, Zap, TrendingUp, BarChart3, PieChart, Activity as PulseIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export const AnalyticsPage = () => {
  const [hourlyData, setHourlyData] = useState([])
  const [riskData, setRiskData] = useState([])
  const [symptomData, setSymptomData] = useState([])
  const [feedbackData, setFeedbackData] = useState([])
  const [stats, setStats] = useState({ totalCases: 0, reviewedCases: 0, pendingCases: 0, throughput: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [hourly, risk, symptoms, feedback, performance] = await Promise.all([
          analyticsService.getTriageVolume(),
          analyticsService.getRiskDistribution(),
          analyticsService.getSymptomFrequency(),
          analyticsService.getFeedbackDistribution(),
          analyticsService.getPerformanceStats()
        ])
        setHourlyData(hourly)
        setRiskData(risk)
        setSymptomData(symptoms)
        setFeedbackData(feedback)
        setStats(performance)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <div className="p-12 font-mono-technical font-bold uppercase animate-pulse text-primary flex items-center gap-4">
      <RefreshCw className="animate-spin" />
      SYNCHRONIZING NEURAL ANALYTICS...
    </div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b-2 border-primary pb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            SYSTEM <span className="text-primary">INTELLIGENCE</span>
          </h2>
          <p className="font-mono-technical text-xs opacity-60 mt-2 uppercase tracking-widest">Clinical Audit & AI Core Performance Metrics</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="font-mono-technical text-[10px] border border-primary px-3 py-1.5 bg-on-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              SYNC: ACTIVE
           </div>
           <button className="font-mono-technical text-[10px] border border-primary px-3 py-1.5 bg-surface hover:bg-primary hover:text-on-primary transition-all uppercase font-bold">
              Export CSV
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
      >
         {[
           { label: 'Total Input', value: stats.totalCases, icon: Activity, color: 'text-primary' },
           { label: 'Reviewed', value: stats.reviewedCases, icon: CheckCircle, color: 'text-green-600' },
           { label: 'Pending', value: stats.pendingCases, icon: Clock, color: 'text-orange-600' },
           { label: 'Efficiency', value: `${stats.throughput}%`, icon: Zap, color: 'text-yellow-500' }
         ].map((kpi, idx) => (
           <motion.div key={idx} variants={itemVariants} className="border border-primary p-6 bg-surface shadow-[6px_6px_0px_#1A1AFF]">
             <span className="block font-mono-technical text-[10px] opacity-60 mb-3 font-bold uppercase tracking-wider">{kpi.label}</span>
             <div className="flex items-end justify-between">
                <span className="text-4xl font-black">{kpi.value}</span>
                <kpi.icon size={20} className={`${kpi.color} opacity-80`} />
             </div>
           </motion.div>
         ))}
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        
        {/* 1. Hourly Activity (Line Chart) */}
        <motion.div variants={itemVariants} className="border-2 border-primary bg-surface p-6 shadow-brutal flex flex-col h-[480px]">
          <div className="flex justify-between items-center border-b border-primary/20 pb-4 mb-4">
             <div className="flex items-center gap-2">
                <PulseIcon size={16} className="text-primary" />
                <h3 className="font-mono-technical font-bold text-sm tracking-widest uppercase">Hourly Triage Volume</h3>
             </div>
             <span className="font-mono-technical text-[10px] opacity-50 uppercase">Today (06:00-22:00)</span>
          </div>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="time" tick={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }} stroke="var(--color-primary)" />
                <YAxis tick={{ fontFamily: 'monospace', fontSize: 10 }} stroke="var(--color-primary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-primary)', color: '#FFF', border: 'none', borderRadius: 0, fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#FFF' }}
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#FFF', stroke: 'var(--color-primary)', strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Risk Distribution (Horizontal Bar Chart) */}
        <motion.div variants={itemVariants} className="border-2 border-primary bg-surface p-6 shadow-brutal flex flex-col h-[480px]">
          <div className="flex justify-between items-center border-b border-primary/20 pb-4 mb-4">
             <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                <h3 className="font-mono-technical font-bold text-sm tracking-widest uppercase">Risk Distribution</h3>
             </div>
             <span className="font-mono-technical text-[10px] opacity-50 uppercase">Aggregate Load</span>
          </div>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={riskData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }} stroke="var(--color-primary)" width={70} />
                <Tooltip 
                   cursor={{ fill: 'rgba(26,26,255,0.05)' }}
                   contentStyle={{ border: '1px solid var(--color-primary)', borderRadius: 0, fontFamily: 'monospace', fontSize: '10px' }}
                />
                <Bar dataKey="value" animationDuration={1000}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 font-mono-technical text-[9px] text-primary/60 text-center uppercase tracking-tighter font-bold">
            Red: High Criticality • Amber: Moderate • Green: Clinical Stabilized
          </p>
        </motion.div>

        {/* 3. Symptom Frequency (Horizontal Bar Chart) */}
        <motion.div variants={itemVariants} className="border-2 border-primary bg-surface p-6 shadow-brutal flex flex-col h-[480px]">
          <div className="flex justify-between items-center border-b border-primary/20 pb-4 mb-4">
             <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="font-mono-technical font-bold text-sm tracking-widest uppercase">Top Symptoms (L7D)</h3>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={symptomData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 'bold' }} stroke="var(--color-primary)" width={120} />
                <Tooltip contentStyle={{ border: '1px solid var(--color-primary)', borderRadius: 0, fontFamily: 'monospace', fontSize: '10px' }} />
                <Bar dataKey="count" fill="var(--color-primary)" fillOpacity={0.6} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. Feedback Distribution (Radial Bar Chart) */}
        <motion.div variants={itemVariants} className="border-2 border-primary bg-surface p-6 shadow-brutal flex flex-col h-[480px]">
          <div className="flex justify-between items-center border-b border-primary/20 pb-4 mb-4">
             <div className="flex items-center gap-2">
                <PieChart size={16} className="text-primary" />
                <h3 className="font-mono-technical font-bold text-sm tracking-widest uppercase">AI Trust Index</h3>
             </div>
             <span className="font-mono-technical text-[10px] opacity-50 uppercase">Doctor Ratings</span>
          </div>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={20} data={feedbackData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#1A1AFF', fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold' }}
                  background
                  clockWise
                  dataKey="value"
                  animationDuration={2500}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: 0, fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase' }} />
                <Tooltip contentStyle={{ border: '1px solid var(--color-primary)', borderRadius: 0, fontFamily: 'monospace', fontSize: '10px' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 border border-primary/20 p-4 bg-primary/5">
             <p className="font-mono-technical text-[10px] text-primary uppercase font-bold text-center">
                *Composite index based on feedback loop accuracy
             </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}

import { RefreshCw } from 'lucide-react'

