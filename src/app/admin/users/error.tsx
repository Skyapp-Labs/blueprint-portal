'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <Button variant="outline" onClick={unstable_retry}>
        Try again
      </Button>
    </div>
  );
}
