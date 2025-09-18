'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { setFilters, clearFilters, setCategoryFormOpen } from '@/store/slices/uiSlice';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { useGetTaskStatsQuery } from '@/store/api/tasksApi';
import { 
  HomeIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import type { RootState } from '@/store';
import type { Priority } from '@/types';
import { getPriorityColor } from '@/utils';

export function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen, filters } = useSelector((state: RootState) => state.ui);
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const { data: statsResponse } = useGetTaskStatsQuery();
  
  const categories = categoriesResponse?.data || [];
  const stats = statsResponse?.data;

  const filterOptions = [
    {
      label: 'All Tasks',
      icon: HomeIcon,
      count: stats?.total || 0,
      onClick: () => dispatch(clearFilters()),
      active: Object.keys(filters).length === 0,
    },
    {
      label: 'Completed',
      icon: CheckCircleIcon,
      count: stats?.completed || 0,
      onClick: () => dispatch(setFilters({ completed: true })),
      active: filters.completed === true,
    },
    {
      label: 'Pending',
      icon: ClockIcon,
      count: stats?.pending || 0,
      onClick: () => dispatch(setFilters({ completed: false })),
      active: filters.completed === false,
    },
    {
      label: 'Overdue',
      icon: ExclamationTriangleIcon,
      count: stats?.overdue || 0,
      onClick: () => dispatch(setFilters({ completed: false, dueDateBefore: new Date().toISOString() })),
      active: !!filters.dueDateBefore,
    },
  ];

  const priorityOptions: { label: string; value: Priority; color: string }[] = [
    { label: 'High Priority', value: 'high', color: 'text-red-600' },
    { label: 'Medium Priority', value: 'medium', color: 'text-yellow-600' },
    { label: 'Low Priority', value: 'low', color: 'text-green-600' },
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-40 ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          {/* Task Filters */}
          <div className="space-y-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.label}
                  variant={option.active ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
                  onClick={option.onClick}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-2 flex-1 text-left">{option.label}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {option.count}
                      </span>
                    </>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Priority Filters */}
          {sidebarOpen && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Priority</h3>
              <div className="space-y-1">
                {priorityOptions.map((priority) => (
                  <Button
                    key={priority.value}
                    variant={filters.priority === priority.value ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => dispatch(setFilters({ priority: priority.value }))}
                  >
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority.value).bg}`} />
                    <span className="ml-2">{priority.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {sidebarOpen && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dispatch(setCategoryFormOpen(true))}
                >
                  <PlusIcon className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.categoryId === category.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => dispatch(setFilters({ categoryId: category.id }))}
                  >
                    <TagIcon className="h-4 w-4" style={{ color: category.color }} />
                    <span className="ml-2">{category.name}</span>
                  </Button>
                ))}
                
                {categories.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                    No categories yet.
                    <br />
                    Create your first category!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
