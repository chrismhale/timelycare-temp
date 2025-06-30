"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [user, token, router]);

  if (!token) {
    return <p>Redirecting...</p>; // Or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute; 