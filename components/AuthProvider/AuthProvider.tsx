'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { checkSession, getMe, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

const privateRoutes = ['/profile', '/notes'];

export default function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const setUser = useAuthStore(state => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated,
  );

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const hasSession = await checkSession();

        if (hasSession) {
          const user = await getMe();
          setUser(user);
        } else {
          clearIsAuthenticated();

          if (privateRoutes.some(route => pathname.startsWith(route))) {
            await logout().catch(() => undefined);
            router.push('/sign-in');
            return;
          }
        }
      } finally {
        setIsChecking(false);
      }
    };

    verifySession();
  }, [pathname, router, setUser, clearIsAuthenticated]);

  if (isChecking) {
    return <p>Loading, please wait...</p>;
  }

  return children;
}