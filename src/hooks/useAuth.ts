import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabase";
import { setUser, setLoading, setError } from "@/store/slices/authSlice";
import type { RootState } from "@/store";
import type { User } from "@/types";

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if Supabase is properly configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          "Supabase not configured. Please add your environment variables."
        )
      );
      return;
    }

    // Get initial session
    // const getInitialSession = async () => {
    //   try {
    //     dispatch(setLoading(true));
    //     const { data: { session }, error } = await supabase.auth.getSession();

    //     if (error) {
    //       dispatch(setError(error.message));
    //       return;
    //     }

    //     if (session?.user) {
    //       const user: User = {
    //         id: session.user.id,
    //         email: session.user.email!,
    //         name: session.user.user_metadata?.name || session.user.email,
    //         avatar: session.user.user_metadata?.avatar_url,
    //         createdAt: session.user.created_at,
    //         updatedAt: session.user.updated_at || session.user.created_at,
    //       };
    //       dispatch(setUser(user));
    //     } else {
    //       dispatch(setUser(null));
    //     }
    //   } catch (error) {
    //     dispatch(setError(error instanceof Error ? error.message : 'Authentication error'));
    //   }
    // };

    // getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
            createdAt: session.user.created_at,
            updatedAt: session.user.updated_at || session.user.created_at,
          };
          dispatch(setUser(user));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error ? error.message : "Authentication error"
          )
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        dispatch(setError(error.message));
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      dispatch(setError(message));
      return { error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch(setError(error.message));
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      dispatch(setError(message));
      return { error: message };
    }
  };

  const signOut = async () => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signOut();

      if (error) {
        dispatch(setError(error.message));
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign out failed";
      dispatch(setError(message));
      return { error: message };
    }
  };

  return {
    ...auth,
    signUp,
    signIn,
    signOut,
  };
}
