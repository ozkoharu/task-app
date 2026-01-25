'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/tasks', label: 'Task List' },
  { href: '/taskmap', label: 'Task Map' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-tarkov-dark/50 border-b border-tarkov-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-tarkov-accent text-tarkov-accent'
                    : 'border-transparent text-tarkov-text hover:text-tarkov-accent hover:border-tarkov-accent/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
