/**
 * Header Component
 *
 * Simple header without navigation (navigation is in sidebar).
 */

import React from 'react';
import { BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
      <div className="flex items-center">
        <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
        <h1 className="text-xl font-bold text-gray-900">Boolean Transformational Prover</h1>
      </div>
    </header>
  );
}
