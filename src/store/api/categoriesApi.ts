import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category, CreateCategoryData, ApiResponse } from '@/types';
import { supabase } from '@/lib/supabase';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/categories',
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers.set('authorization', `Bearer ${session.access_token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '',
      providesTags: ['Category'],
    }),
    
    getCategory: builder.query<ApiResponse<Category>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    
    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryData>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    
    updateCategory: builder.mutation<ApiResponse<Category>, { id: string; data: CreateCategoryData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),
    
    deleteCategory: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category', id }, 'Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
