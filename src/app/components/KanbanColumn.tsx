import { TaskCard, Task } from './TaskCard';
import { Plus, Inbox } from 'lucide-react';
import { useState } from 'react';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  bgColor: string;
}

export function KanbanColumn({ title, tasks, color, bgColor }: KanbanColumnProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex-shrink-0 w-80 flex flex-col">
      <div className={`${bgColor} rounded-t-xl border-x border-t border-gray-200 px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <span className="bg-white/60 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <div className="relative">
            <button 
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white/80 rounded-md transition-all"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Plus className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                Add task to this column
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={`flex-1 ${bgColor} rounded-b-xl border-x border-b border-gray-200 p-3 space-y-3 min-h-[500px] overflow-y-auto`}>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-white/30">
            <Inbox className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400 font-medium">No tasks yet</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}