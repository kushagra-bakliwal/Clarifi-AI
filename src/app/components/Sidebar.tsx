import { LayoutDashboard, Star, Lightbulb, Sparkles, FileText, MessageSquare, Plug } from 'lucide-react';
import clarifiLogo from 'figma:asset/f04d43a48a1d50b46f6f1bbbb319070b7bb5678b.webp';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: Star, label: 'Reviews', page: 'reviews' },
  { icon: Lightbulb, label: 'Feature Requests', page: 'feature-requests' },
  { icon: Sparkles, label: 'AI Recommendations', page: 'ai-recommendations' },
  { icon: FileText, label: 'Reports', page: 'reports' },
  { icon: MessageSquare, label: 'Chat with Data', page: 'chat' },
  { icon: Plug, label: 'Connectors', page: 'connectors' },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 flex flex-col lg:w-64 md:w-20 sm:w-20">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img src={clarifiLogo} alt="Clarifi AI" className="w-10 h-10 object-contain flex-shrink-0" />
          <div className="lg:block md:hidden sm:hidden">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Clarifi AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Feedback Intelligence</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium lg:block md:hidden sm:hidden">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}