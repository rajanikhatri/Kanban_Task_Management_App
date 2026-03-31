import { KanbanColumn } from './KanbanColumn';
import { Task } from './TaskCard';

interface KanbanBoardProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  inReviewTasks: Task[];
  doneTasks: Task[];
}

export function KanbanBoard({ todoTasks, inProgressTasks, inReviewTasks, doneTasks }: KanbanBoardProps) {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-100">
      <div className="h-full px-6 py-6">
        <div className="flex gap-4 h-full min-w-max">
          <KanbanColumn 
            title="To Do" 
            tasks={todoTasks} 
            color="bg-gray-400"
            bgColor="bg-gray-50"
          />
          <KanbanColumn 
            title="In Progress" 
            tasks={inProgressTasks} 
            color="bg-blue-500"
            bgColor="bg-blue-50"
          />
          <KanbanColumn 
            title="In Review" 
            tasks={inReviewTasks} 
            color="bg-purple-500"
            bgColor="bg-purple-50"
          />
          <KanbanColumn 
            title="Done" 
            tasks={doneTasks} 
            color="bg-green-500"
            bgColor="bg-green-50"
          />
        </div>
      </div>
    </div>
  );
}