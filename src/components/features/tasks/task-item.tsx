'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdateTaskMutation, useDeleteTaskMutation } from '@/store/api/tasksApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { setSelectedTaskId, setTaskFormOpen } from '@/store/slices/uiSlice';
import { 
  CalendarIcon, 
  TagIcon, 
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatDate, getPriorityColor, isTaskOverdue } from '@/utils';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const dispatch = useDispatch();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = categoriesResponse?.data || [];
  const category = categories.find(c => c.id === task.categoryId);
  const priorityColors = getPriorityColor(task.priority);
  const overdue = isTaskOverdue(task);

  const handleToggleComplete = async () => {
    try {
      await updateTask({
        id: task.id,
        data: { completed: !task.completed }
      }).unwrap();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEdit = () => {
    console.log('handleEdit', task.id);
    dispatch(setSelectedTaskId(task.id));
    dispatch(setTaskFormOpen(true));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id).unwrap();
      } catch (error) {
        console.error('Failed to delete task:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`group p-4 rounded-lg border bg-card hover:shadow-sm transition-all ${
      task.completed ? 'opacity-75' : ''
    } ${overdue && !task.completed ? 'border-destructive/50' : 'border-border'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          className="mt-0.5"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-medium text-sm leading-5 ${
                task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2">
                {/* Priority Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}`}>
                  {task.priority}
                </span>
                
                {/* Due Date */}
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-xs ${
                    overdue && !task.completed ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {overdue && !task.completed && (
                      <ExclamationTriangleIcon className="h-3 w-3" />
                    )}
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                
                {/* Category */}
                {category && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TagIcon className="h-3 w-3" style={{ color: category.color }} />
                    <span>{category.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleEdit}
              >
                <PencilIcon className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
