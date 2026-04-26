import React from 'react';
import { Globe, ChevronDown, Settings, Shield, Cpu, Command } from 'lucide-react';

interface NavbarProps {
  currentLanguage: string;
  onOpenSettings: () => void;
  isLoading?: boolean;
}

export default function Navbar({ currentLanguage, onOpenSettings, isLoading }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[80] p-4 sm:p-6 flex justify-between items-center pointer-events-none">
      {/* Left: System Status */}
      <div className="flex items-center space-x-3 pointer-events-auto">
        <div className="flex items-center space-x-3 bg-neutral-900/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-2 border-r border-white/10 pr-3 mr-1">
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Secure Node</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Alpha • Decision OS</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2 bg-neutral-900/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl">
          <Cpu className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
            System Status: <span className={isLoading ? 'text-purple-400 animate-pulse' : 'text-emerald-500'}>
              {isLoading ? 'Processing' : 'Live'}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Command Controls */}
      <div className="flex items-center space-x-3 pointer-events-auto">
        <div className="hidden md:flex items-center space-x-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-2xl">
          <Command className="w-3 h-3 text-neutral-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">⌘K Command Center</span>
        </div>

        <div className="relative">
          <button 
            onClick={onOpenSettings}
            className="flex items-center space-x-3 bg-neutral-900/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl hover:bg-white/5 transition-all group shadow-2xl"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {currentLanguage === 'auto' ? 'Auto Detect' : currentLanguage}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-all" />
          </button>
        </div>

        <button 
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/5 hover:border-purple-500/30 transition-all group shadow-2xl"
        >
          <Settings className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 group-hover:rotate-90 transition-all duration-700" />
        </button>
      </div>
    </nav>
  );
}
