import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Helper function to get authenticated user and create authenticated Supabase client
async function getAuthenticatedUserAndClient() {
  const headersList = await headers();
  const authorization = headersList.get('authorization');
  
  if (!authorization) {
    throw new Error('No authorization header');
  }

  const token = authorization.replace('Bearer ', '');
  
  // Verify the token using the default client
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  // Create an authenticated client for database operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }
  
  const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  
  return { user, supabase: authenticatedClient };
}

// GET /api/tasks/stats - Get task statistics
export async function GET(request: NextRequest) {
  try {
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();

    // Get total tasks count
    const { count: total } = await authenticatedSupabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get completed tasks count
    const { count: completed } = await authenticatedSupabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    // Get pending tasks count
    const { count: pending } = await authenticatedSupabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', false);

    // Get overdue tasks count
    const today = new Date().toISOString();
    const { count: overdue } = await authenticatedSupabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', false)
      .lt('due_date', today);

    const stats = {
      total: total || 0,
      completed: completed || 0,
      pending: pending || 0,
      overdue: overdue || 0,
      completionRate: total ? Math.round((completed || 0) / total * 100) : 0,
    };

    return NextResponse.json({ data: stats });

  } catch (error) {
    console.error('Error in GET /api/tasks/stats:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
