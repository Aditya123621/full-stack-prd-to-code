'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import type { RootState } from '@/store';

export function Header() {
  const dispatch = useDispatch();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-4 w-4" />;
      case 'dark':
        return <MoonIcon className="h-4 w-4" />;
      default:
        return <ComputerDesktopIcon className="h-4 w-4" />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">TaskMaster</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {getThemeIcon()}
          </Button>

          <div className="flex items-center gap-3 ml-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
