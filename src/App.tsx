/**
 * Main Application Component
 *
 * This is the root component that provides the layout and structure for the
 * Boolean Transformational Prover application.
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';

export default function App() {
  const [activeTab, setActiveTab] = useState<'proof' | 'expression' | 'ast' | 'truth-table'>(
    'proof'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Header />
        <MainContent activeTab={activeTab} className="flex-1" />
      </div>
    </div>
  );
}
