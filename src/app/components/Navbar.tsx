import { Plus, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        </div>
        
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>
    </nav>
  );
}