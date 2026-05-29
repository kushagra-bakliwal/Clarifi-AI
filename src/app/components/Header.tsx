import { Calendar, Filter, ChevronDown, User, Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { useTheme } from '@/app/contexts/ThemeContext';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  onSignOut?: () => void;
}

export function Header({ onNavigate, onSignOut }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 lg:left-64 md:left-20 sm:left-20 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Select defaultValue="30">
            <SelectTrigger className="w-[140px] sm:w-[180px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Select defaultValue="all-sentiment">
            <SelectTrigger className="w-[140px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-sentiment">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue="all-topics">
            <SelectTrigger className="w-[140px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-topics">All Topics</SelectItem>
              <SelectItem value="bugs">Bugs</SelectItem>
              <SelectItem value="ui-ux">UI/UX</SelectItem>
              <SelectItem value="pricing">Pricing</SelectItem>
              <SelectItem value="shipping">Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
          Export Report
        </Button>
        
        {/* Dark Mode Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="p-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
              <Avatar className="w-9 h-9 cursor-pointer">
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  JD
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuLabel className="dark:text-gray-300">
              <div className="flex flex-col">
                <span className="font-semibold">John Doe</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  john.doe@company.com
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem
              onClick={() => onNavigate?.('profile')}
              className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer">
              Account Plan
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem className="dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400" onClick={onSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}