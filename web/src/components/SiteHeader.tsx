"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from './ui/Button';
import { usePathname } from 'next/navigation';

const SiteHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard', auth: true },
  ];

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          ProperView
        </Link>
        <div className="flex items-center space-x-4">
          <ul className="flex items-center space-x-4">
            {navLinks.map((link) => {
              if (link.auth && !user) return null;
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {user ? (
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader; 