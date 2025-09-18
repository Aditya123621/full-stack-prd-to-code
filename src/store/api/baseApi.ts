import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers.set('authorization', `Bearer ${session.access_token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Task', 'Category', 'User'],
  endpoints: () => ({}),
});
