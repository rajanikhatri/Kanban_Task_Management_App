import { Calendar, Flag } from 'lucide-react';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate?: string;
  assignee?: {
    name: string;
    avatar: string;
    initials: string;
  };
}

interface TaskCardProps {
  task: Task;
}

const priorityConfig = {
  low: {
    color: 'text-green-600 bg-green-50',
    label: 'Low',
    borderColor: 'border-green-200',
    leftBorder: 'border-l-green-500'
  },
  medium: {
    color: 'text-yellow-600 bg-yellow-50',
    label: 'Medium',
    borderColor: 'border-yellow-200',
    leftBorder: 'border-l-yellow-500'
  },
  high: {
    color: 'text-red-600 bg-red-50',
    label: 'High',
    borderColor: 'border-red-200',
    leftBorder: 'border-l-red-500'
  }
};

export function TaskCard({ task }: TaskCardProps) {
  const priorityStyle = priorityConfig[task.priority];
  
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 border-l-4 ${priorityStyle.leftBorder} hover:shadow-lg hover:border-gray-300 hover:-translate-y-1 transition-all duration-200 cursor-grab active:cursor-grabbing group`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-medium text-gray-900 leading-snug flex-1">
          {task.title}
        </h3>
        {task.assignee && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-white">{task.assignee.initials}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between gap-3">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${priorityStyle.color} border ${priorityStyle.borderColor}`}>
          <Flag className="w-3 h-3" />
          <span className="text-xs font-medium">{priorityStyle.label}</span>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}