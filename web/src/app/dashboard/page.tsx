"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';

const AgentDashboard = dynamic(() => import('./AgentDashboard'), { ssr: false });

const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <AgentDashboard />
    </ProtectedRoute>
  );
};

export default DashboardPage; 