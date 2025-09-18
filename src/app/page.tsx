"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { AuthForm } from "@/components/features/auth/auth-form";
import { TaskDashboard } from "@/components/features/tasks/task-dashboard";

export default function Home() {
  const { isAuthenticated, loading, error } = useAuth();
  useTheme(); // Initialize theme without using the value
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Debug logging (only log when values change)
  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, loading, error });
    console.log("Env vars:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      service_role_key: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    });
  }, [isAuthenticated, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show setup instructions if there's an error (likely Supabase config issue)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              TaskMaster
            </h1>
            <p className="text-muted-foreground mb-6">Setup Required</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              🚀 Setup Instructions
            </h2>

            <div className="space-y-3 text-sm">
              <p>
                <strong>1. Create a Supabase Project:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    className="text-primary underline"
                  >
                    supabase.com
                  </a>
                </li>
                <li>Create a new project</li>
                <li>Wait for it to be ready</li>
              </ul>

              <p>
                <strong>2. Get Your API Keys:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                <li>Go to Settings → API</li>
                <li>Copy your Project URL and anon public key</li>
              </ul>

              <p>
                <strong>3. Setup Database:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                <li>Go to SQL Editor in your Supabase dashboard</li>
                <li>
                  Run the SQL from <code>database-schema.sql</code> file
                </li>
              </ul>

              <p>
                <strong>4. Update Environment Variables:</strong>
              </p>
              <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                <li>
                  Edit <code>.env.local</code> file in the project root
                </li>
                <li>
                  Replace the placeholder values with your actual Supabase
                  credentials
                </li>
                <li>
                  Restart the development server: <code>npm run dev</code>
                </li>
              </ul>
            </div>

            <div className="bg-muted p-3 rounded text-xs">
              <p>
                <strong>Current error:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              TaskMaster
            </h1>
            <p className="text-muted-foreground">
              Organize your tasks, boost your productivity
            </p>
          </div>

          <AuthForm
            mode={authMode}
            onToggleMode={() =>
              setAuthMode(authMode === "signin" ? "signup" : "signin")
            }
          />
        </div>
      </div>
    );
  }

  return <TaskDashboard />;
}
