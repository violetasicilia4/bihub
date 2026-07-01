/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database, PlusCircle, HelpCircle, ShieldAlert, ArrowUpRight, Lock, Unlock, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenModal: (type: 'access' | 'error' | 'suggest') => void;
  totalCount: number;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Header({ onOpenModal, totalCount, isAdmin, onLoginClick, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-galicia-border rounded-b-3xl shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Brand Area */}
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 100 100" className="h-9 w-9 shrink-0 select-none shadow-sm shadow-neutral-900/5 rounded-xl" xmlns="http://www.w3.org/2000/svg" id="galicia-header-logo">
              {/* Orange rounded square background */}
              <rect x="2" y="2" width="96" height="96" rx="22" fill="#FF5E00" />
              
              <g transform="translate(21.65, 21.65) scale(0.09)">
                {/* Tallest bar (right) */}
                <rect x="256" y="0" width="219" height="630" rx="26" fill="#FFFFFF" fillOpacity={0.4} />
                
                {/* Middle bar (middle) */}
                <path 
                  d="M346,604 L346,630 L320,630 L153,630 C138.640597,630 127,618.359403 127,604 L127,183 C127,168.640597 138.640597,157 153,157 L320,157 C334.359403,157 346,168.640597 346,183 L346,604 Z" 
                  fill="#FFFFFF" 
                  fillOpacity={0.7} 
                />
                
                {/* Shortest bar (left) */}
                <path 
                  d="M219,604 L219,630 L193,630 L26,630 C11.6405965,630 1.75851975e-15,618.359403 0,604 L0,341 C-1.75851975e-15,326.640597 11.6405965,315 26,315 L193,315 C207.359403,315 219,326.640597 219,341 L219,604 Z" 
                  fill="#FFFFFF" 
                />
              </g>
            </svg>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-galicia-dark text-lg leading-none tracking-tight">
                  ADYR BI HUB
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-medium">Mapa de tableros</p>
            </div>
          </div>

          {/* Right CTA Actions */}
          <div className="flex items-center gap-2">
            {/* Admin toggle button */}
            {isAdmin ? (
              <button
                id="header-admin-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer border border-rose-200"
                type="button"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cerrar Admin</span>
                <span className="sm:hidden">Salir</span>
              </button>
            ) : (
              <button
                id="header-admin-login-btn"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 rounded-xl font-sans text-xs font-semibold transition-all cursor-pointer border border-galicia-border"
                type="button"
                title="Ingresar como Administrador"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
