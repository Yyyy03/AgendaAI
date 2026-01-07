import React from 'react';
import { Clock, User, ChevronRight } from 'lucide-react';
import { AgendaItem } from '../types';

interface TimelineProps {
  items: AgendaItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  if (items.length === 0) return null;

  // Calculate cumulative time for a rough start time visual (starting at 9:00 AM)
  let currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0);

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-50 before:via-indigo-200 before:to-indigo-50">
      {items.map((item, index) => {
        const itemStartTime = new Date(currentTime);
        const startTimeStr = itemStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Advance time for next item
        currentTime.setMinutes(currentTime.getMinutes() + item.durationMinutes);
        const endTimeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={index} className="relative group">
            {/* Dot on the timeline */}
            <div className="absolute -left-10 top-6 w-5 h-5 rounded-full border-4 border-white bg-indigo-500 shadow-md z-10 group-hover:scale-110 transition-transform"></div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    {startTimeStr} - {endTimeStr}
                  </div>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {item.durationMinutes} min
                  </span>
                </div>
                {item.speaker && (
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                       <User size={12} />
                       {item.speaker}
                   </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.topic}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
      
      {/* End of meeting indicator */}
      <div className="relative">
          <div className="absolute -left-10 top-1 w-5 h-5 rounded-full border-4 border-white bg-slate-300 shadow-sm z-10"></div>
          <div className="text-xs text-slate-400 font-medium pl-1">End of Meeting</div>
      </div>
    </div>
  );
};

export default Timeline;