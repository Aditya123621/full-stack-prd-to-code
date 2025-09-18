import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCategorySchema } from '@/lib/validations';
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

// GET /api/categories - Get all categories for the user
export async function GET(request: NextRequest) {
  try {
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();

    const { data, error } = await authenticatedSupabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Transform data to match our Category interface
    const categories = data?.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color,
      userId: category.user_id,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    })) || [];

    return NextResponse.json({ data: categories });

  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const { user, supabase: authenticatedSupabase } = await getAuthenticatedUserAndClient();
    const body = await request.json();
    
    // Validate request body
    const validatedData = createCategorySchema.parse(body);

    const { data, error } = await authenticatedSupabase
      .from('categories')
      .insert([
        {
          name: validatedData.name,
          color: validatedData.color,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    // Transform response
    const category = {
      id: data.id,
      name: data.name,
      color: data.color,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ data: category }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    
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
