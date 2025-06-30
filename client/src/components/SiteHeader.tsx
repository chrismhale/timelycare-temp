import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const SiteHeader: React.FC = () => {
  const { token, logout } = useAuth();
  const isAuthenticated = !!token;

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <Link to="/">ProperView</Link>
        </h1>
        <nav className="space-x-6 hidden sm:block">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? 'font-bold underline text-yellow-300' : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `hover:underline ${isActive ? 'font-bold underline text-yellow-300' : ''}`
            }
          >
            Agent Dashboard
          </NavLink>
          {!isAuthenticated ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `hover:underline ${isActive ? 'font-bold underline text-yellow-300' : ''}`
              }
            >
              Login
            </NavLink>
          ) : (
            <Button onClick={logout} className="bg-white/10 hover:bg-white/20 text-white py-1 px-3 rounded text-sm">Logout</Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader; 