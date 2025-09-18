'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskList } from './task-list';
import { TaskForm } from './task-form';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { setTaskFormOpen, setFilters } from '@/store/slices/uiSlice';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { RootState } from '@/store';
import { debounce } from '@/utils';

export function TaskDashboard() {
  const dispatch = useDispatch();
  const { taskFormOpen, sidebarOpen, filters } = useSelector((state: RootState) => state.ui);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounced search handler
  const debouncedSearch = debounce((term: string) => {
    dispatch(setFilters({ search: term }));
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          <div className="p-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              
              <Button
                onClick={() => dispatch(setTaskFormOpen(true))}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                New Task
              </Button>
            </div>

            {/* Task List */}
            <TaskList />
          </div>
        </main>
      </div>

      {/* Task Form Modal */}
      {taskFormOpen && <TaskForm />}
    </div>
  );
}
