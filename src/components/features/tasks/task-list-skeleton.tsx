export function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-muted rounded animate-pulse mt-0.5" />
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="h-5 bg-muted rounded-full animate-pulse w-12" />
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                    <div className="h-4 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
