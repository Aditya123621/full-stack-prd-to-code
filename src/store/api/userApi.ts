import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User, ApiResponse } from '@/types';
import { supabase } from '@/lib/supabase';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/user',
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers.set('authorization', `Bearer ${session.access_token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/profile',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    deleteAccount: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/profile',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} = userApi;
