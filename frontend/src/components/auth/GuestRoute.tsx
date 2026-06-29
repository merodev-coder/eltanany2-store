// frontend/src/components/auth/GuestRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute: redirects authenticated users to /profile.
 * Use for /login and /signup pages.
 */
export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
