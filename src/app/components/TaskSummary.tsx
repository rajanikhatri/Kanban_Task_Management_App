import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface TaskSummaryProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export function TaskSummary({ totalTasks, completedTasks, overdueTasks }: TaskSummaryProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-8 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-sm font-semibold text-gray-900">{totalTasks}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">Completed:</span>
          <span className="text-sm font-semibold text-gray-900">{completedTasks}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-gray-600">Overdue:</span>
          <span className="text-sm font-semibold text-gray-900">{overdueTasks}</span>
        </div>
      </div>
    </div>
  );
}
