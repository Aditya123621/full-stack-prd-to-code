'use client';

import { useSelector } from 'react-redux';
import { useGetTasksQuery } from '@/store/api/tasksApi';
import { TaskItem } from './task-item';
import { TaskListSkeleton } from './task-list-skeleton';
import type { RootState } from '@/store';

export function TaskList() {
  const filters = useSelector((state: RootState) => state.ui.filters);
  
  const { 
    data: tasksResponse, 
    isLoading, 
    error 
  } = useGetTasksQuery(filters);

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-sm mb-2">Failed to load tasks</div>
        <div className="text-muted-foreground text-xs">
          Please try refreshing the page
        </div>
      </div>
    );
  }

  const tasks = tasksResponse?.data || [];

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          {Object.keys(filters).length > 0 ? (
            <>
              <h3 className="text-lg font-medium mb-2">No tasks match your filters</h3>
              <p className="text-sm">Try adjusting your search criteria or filters</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-sm">Create your first task to get started!</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
      
      {tasksResponse?.pagination && tasksResponse.pagination.totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <div className="text-sm text-muted-foreground">
            Showing {tasks.length} of {tasksResponse.pagination.total} tasks
          </div>
        </div>
      )}
    </div>
  );
}
