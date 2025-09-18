import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createTaskSchema, taskFiltersSchema } from '@/lib/validations';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Helper function to get authenticated user and create authenticated Supabase client
async function getAuthenticatedUserAndClient() {
  const headersList = await headers();
  const authorization = headersList.get('authorization');
  
  console.log('Authorization header:', authorization);
  
  if (!authorization) {
    throw new Error('No authorization header');
  }

  const token = authorization.replace('Bearer ', '');
  console.log('Extracted token:', token.substring(0, 20) + '...');
  
  // Verify the token using the default client
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  console.log('Auth result - User:', user?.id, 'Error:', error);
  
  if (error || !user) {
    console.error('Authentication failed:', error);
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

// GET /api/tasks - Get tasks with filtering, pagination, and search
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/tasks - Starting request');
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();
    console.log('User authenticated:', user.id);
    
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const params = Object.fromEntries(searchParams.entries());
    console.log('Query params:', params);
    
    const filters = taskFiltersSchema.parse({
      ...params,
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 20,
    });
    console.log('Parsed filters:', filters);

    // Build Supabase query
    let query = authenticatedSupabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.dueDateBefore) {
      query = query.lte('due_date', filters.dueDateBefore);
    }

    if (filters.dueDateAfter) {
      query = query.gte('due_date', filters.dueDateAfter);
    }

    // Apply pagination
    const offset = (filters.page - 1) * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    console.log('Executing query...');
    const { data, error, count } = await query;
    console.log('Query result - Data count:', data?.length, 'Error:', error, 'Total count:', count);

    if (error) {
      console.error('Database error in GET /api/tasks:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch tasks',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Transform data to match our Task interface
    const tasks = data?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.due_date,
      categoryId: task.category_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    })) || [];

    const totalPages = Math.ceil((count || 0) / filters.limit);

    return NextResponse.json({
      data: tasks,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('authorization') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Unauthorized', details: error.message },
          { status: 401 }
        );
      }
      
      // Handle validation errors
      if (error.message.includes('Invalid') || error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      console.error('Supabase not configured. URL:', supabaseUrl, 'Key exists:', !!supabaseAnonKey);
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'Supabase environment variables are missing. Please check your .env.local file.'
        },
        { status: 500 }
      );
    }
    
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();
    const body = await request.json();
    
    // Validate request body
    console.log('Raw request body:', body);
    const validatedData = createTaskSchema.parse(body);
    console.log('Validated data:', validatedData);

    console.log('Inserting task with data:', {
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority,
      due_date: validatedData.dueDate,
      category_id: validatedData.categoryId,
      user_id: user.id,
      completed: false,
    });

    const { data, error } = await authenticatedSupabase
      .from('tasks')
      .insert([
        {
          title: validatedData.title,
          description: validatedData.description,
          priority: validatedData.priority,
          due_date: validatedData.dueDate,
          category_id: validatedData.categoryId,
          user_id: user.id,
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to create task',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Transform response
    const task = {
      id: data.id,
      title: data.title,
      description: data.description,
      completed: data.completed,
      priority: data.priority,
      dueDate: data.due_date,
      categoryId: data.category_id,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ data: task }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues || 'Validation failed'
        },
        { status: 400 }
      );
    }
    
    // Handle auth errors
    if (error instanceof Error && (error.message.includes('authorization') || error.message.includes('token'))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Handle other errors
    if (error instanceof Error) {
      console.error('Task creation error:', error.message);
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
