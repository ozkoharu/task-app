'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-tarkov-dark border-b border-tarkov-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-tarkov-accent text-2xl font-bold">
              Tarkov Task Tracker
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
