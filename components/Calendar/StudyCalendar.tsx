
import React, { useMemo } from 'react';
import { StudySession } from '../../types';
// Fixed: Missing import for Icons
import { Icons } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface StudyCalendarProps {
  sessions: StudySession[];
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ sessions }) => {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    return last7Days.map(date => {
      const daySessions = sessions.filter(s => isSameDay(new Date(s.timestamp), date));
      const totalMinutes = daySessions.reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0);
      return {
        date: format(date, 'MMM dd'),
        minutes: Math.round(totalMinutes),
        fullDate: date
      };
    });
  }, [sessions]);

  const totalTime = useMemo(() => {
    const seconds = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }, [sessions]);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Study Time</p>
          <h3 className="text-4xl font-bold text-blue-400 mt-1 tracking-tight">{totalTime}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sessions Completed</p>
          <h3 className="text-4xl font-bold text-emerald-400 mt-1 tracking-tight">{sessions.length}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Daily Average</p>
          <h3 className="text-4xl font-bold text-amber-400 mt-1 tracking-tight">
            {sessions.length > 0 ? Math.round(sessions.reduce((a, b) => a + b.durationSeconds, 0) / (7 * 60)) : 0}m
          </h3>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 h-[400px]">
        <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Learning Velocity (Last 7 Days)
        </h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="m" />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.minutes > 60 ? '#3b82f6' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-lg font-bold mb-4">Recent Sessions</h4>
        <div className="space-y-3">
          {sessions.slice().reverse().map(session => (
            <div key={session.id} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${session.type === 'pomodoro' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  <Icons.Video />
                </div>
                <div>
                  <p className="font-bold text-slate-200">{session.label}</p>
                  <p className="text-xs text-slate-500">{format(new Date(session.timestamp), 'PPP p')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="mono font-bold text-emerald-400">{Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s</p>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{session.type}</p>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-12 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-500">No study sessions recorded yet. Start your first focus session!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyCalendar;
