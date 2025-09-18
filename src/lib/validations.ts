import { z } from 'zod';

export const prioritySchema = z.enum(['low', 'medium', 'high']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  priority: prioritySchema,
  dueDate: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().datetime().optional()
  ),
  categoryId: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().uuid().optional()
  ),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  completed: z.boolean().optional(),
  priority: prioritySchema.optional(),
  dueDate: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().datetime().optional()
  ),
  categoryId: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().uuid().optional()
  ),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

export const taskFiltersSchema = z.object({
  completed: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.boolean().optional()
  ),
  priority: prioritySchema.optional(),
  categoryId: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().uuid().optional()
  ),
  search: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().max(100).optional()
  ),
  dueDateBefore: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().datetime().optional()
  ),
  dueDateAfter: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return val;
    },
    z.string().datetime().optional()
  ),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// API Response schemas
export const apiResponseSchema = z.object({
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Validation helper functions
export const validateTaskData = (data: unknown) => {
  return createTaskSchema.parse(data);
};

export const validateUpdateTaskData = (data: unknown) => {
  return updateTaskSchema.parse(data);
};

export const validateCategoryData = (data: unknown) => {
  return createCategorySchema.parse(data);
};

export const validateTaskFilters = (data: unknown) => {
  return taskFiltersSchema.parse(data);
};
