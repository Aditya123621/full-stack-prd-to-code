import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateTaskSchema } from '@/lib/validations';
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

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();
    const { id } = await params;

    const { data, error } = await authenticatedSupabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch task' },
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

    return NextResponse.json({ data: task });

  } catch (error) {
    console.error('Error in GET /api/tasks/[id]:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a specific task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateTaskSchema.parse(body);

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.completed !== undefined) {
      updateData.completed = validatedData.completed;
    }
    if (validatedData.priority !== undefined) {
      updateData.priority = validatedData.priority;
    }
    if (validatedData.dueDate !== undefined) {
      updateData.due_date = validatedData.dueDate;
    }
    if (validatedData.categoryId !== undefined) {
      updateData.category_id = validatedData.categoryId;
    }

    const { data, error } = await authenticatedSupabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update task' },
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

    return NextResponse.json({ data: task });

  } catch (error) {
    console.error('Error in PATCH /api/tasks/[id]:', error);
    
    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();
    const { id } = await params;

    const { error } = await authenticatedSupabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
