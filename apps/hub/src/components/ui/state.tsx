import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Centered spinner used as a full-page / section loading state. */
export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground', className)}>
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Grid of skeleton cards matching the dashboard card rhythm. */
export function CardSkeletonGrid({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
}

/** Error banner with optional retry. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <div>
        <p className="font-semibold text-rose-300">{title}</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Friendly empty state for lists with no data. */
export function EmptyState({ icon: Icon = Inbox, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground" />
      <div>
        <p className="font-medium">{title}</p>
        {message && <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>}
      </div>
      {action}
    </div>
  );
}
