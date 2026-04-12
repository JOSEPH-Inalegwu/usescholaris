import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';

const ADMIN_UID = 'vnn5Rf2FjGfngTqTZTsDCT90gDT2';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center font-['Lora']">
        <div className="w-8 h-8 border-2 border-[#b32839]/20 border-t-[#b32839] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.uid !== ADMIN_UID) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
