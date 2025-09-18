import { clsx, type ClassValue } from 'clsx';
import { format, isToday, isTomorrow, isYesterday, isPast } from 'date-fns';
import type { Priority, Task } from '@/types';

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date for display in the UI
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Get relative date string (Today, Tomorrow, Yesterday, etc.)
 */
export function getRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return formatDate(dateObj, 'MMM d');
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return isPast(new Date(task.dueDate));
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: Priority): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'low':
      return {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/20',
        text: 'text-gray-800 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-800',
      };
  }
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'High Priority';
    case 'medium':
      return 'Medium Priority';
    case 'low':
      return 'Low Priority';
    default:
      return 'No Priority';
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Sort tasks by priority and due date
 */
export function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // First, sort by completion status (incomplete tasks first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date (earlier dates first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // Finally by creation date (newer first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Filter tasks based on filters
 */
export function filterTasks(tasks: Task[], filters: {
  completed?: boolean;
  priority?: Priority;
  categoryId?: string;
  search?: string;
  dueDateBefore?: string;
  dueDateAfter?: string;
}): Task[] {
  return tasks.filter((task) => {
    // Filter by completion status
    if (filters.completed !== undefined && task.completed !== filters.completed) {
      return false;
    }

    // Filter by priority
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Filter by category
    if (filters.categoryId && task.categoryId !== filters.categoryId) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = task.description?.toLowerCase().includes(searchTerm);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }

    // Filter by due date range
    if (filters.dueDateBefore && task.dueDate) {
      if (new Date(task.dueDate) > new Date(filters.dueDateBefore)) {
        return false;
      }
    }

    if (filters.dueDateAfter && task.dueDate) {
      if (new Date(task.dueDate) < new Date(filters.dueDateAfter)) {
        return false;
      }
    }

    return true;
  });
}
