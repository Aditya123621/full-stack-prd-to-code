import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Task, CreateTaskData, UpdateTaskData, TaskFilters, PaginatedResponse, ApiResponse, TaskStats } from '@/types';
import { supabase } from '@/lib/supabase';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/tasks',
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers.set('authorization', `Bearer ${session.access_token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery,
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<PaginatedResponse<Task>, TaskFilters>({
      query: (filters) => ({
        url: '',
        params: filters,
      }),
      providesTags: ['Task'],
    }),
    
    getTask: builder.query<ApiResponse<Task>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    
    createTask: builder.mutation<ApiResponse<Task>, CreateTaskData>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),
    
    updateTask: builder.mutation<ApiResponse<Task>, { id: string; data: UpdateTaskData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }, 'Task'],
    }),
    
    deleteTask: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Task', id }, 'Task'],
    }),
    
    bulkUpdateTasks: builder.mutation<ApiResponse<Task[]>, { ids: string[]; data: UpdateTaskData }>({
      query: ({ ids, data }) => ({
        url: '/bulk',
        method: 'PATCH',
        body: { ids, data },
      }),
      invalidatesTags: ['Task'],
    }),
    
    bulkDeleteTasks: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Task'],
    }),
    
    getTaskStats: builder.query<ApiResponse<TaskStats>, void>({
      query: () => '/stats',
      providesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkUpdateTasksMutation,
  useBulkDeleteTasksMutation,
  useGetTaskStatsQuery,
} = tasksApi;
