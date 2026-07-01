/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExternalLink, Key, Eye, Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Dashboard } from '../types';

interface DashboardCardProps {
  dashboard: Dashboard;
  onRequestAccess: (dash: Dashboard) => void;
  onRequestError: (dash: Dashboard) => void;
  searchQuery: string;
  isAdmin?: boolean;
  onEdit?: (dash: Dashboard) => void;
  onDelete?: (id: string) => void;
}

export default function DashboardCard({
  dashboard,
  onRequestAccess,
  onRequestError,
  searchQuery,
  isAdmin = false,
  onEdit,
  onDelete
}: DashboardCardProps) {
  const { name, vertical, description, url, updateFrequency, metrics, lastUpdated, viewsCount } = dashboard;

  // Vertical styles
  const getVerticalStyle = (vert: string) => {
    switch (vert) {
      case 'Desarrollo':
        return 'bg-galicia-yellow-light text-amber-950 border-galicia-yellow/30';
      case 'Retención':
        return 'bg-galicia-orange-light text-galicia-orange border-galicia-orange/25';
      case 'Adquisición':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300/60';
      case 'Cross equipo':
      default:
        return 'bg-stone-50 text-stone-800 border-neutral-200/80';
    }
  };

  // Frequency mapping to Spanish values
  const getFrequencyLabel = (freq: string) => {
    const f = freq.toLowerCase();
    if (f === 'diaria' || f === 'daily') return 'Diario';
    if (f === 'semanal' || f === 'weekly') return 'Semanal';
    if (f === 'mensual' || f === 'monthly') return 'Mensual';
    if (f === 'anual' || f === 'annual') return 'Anual';
    if (f === 'tiempo real' || f === 'real-time') return 'Tiempo Real';
    return freq;
  };

  // Helper function to highlight matching search term
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-100 text-neutral-900 font-medium rounded-sm px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div
      id={`card-${dashboard.id}`}
      className={`group flex flex-col justify-between h-full bg-white rounded-2xl border ${isAdmin ? 'border-galicia-orange/30 ring-1 ring-galicia-orange/10' : 'border-galicia-border'} hover:border-galicia-orange hover:shadow-xl hover:shadow-galicia-orange/5 transition-all duration-300 overflow-hidden`}
    >
      {/* Top Section */}
      <div className="p-6 pb-4">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <span
            id={`badge-vertical-${dashboard.id}`}
            className={`font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${getVerticalStyle(vertical)}`}
          >
            {vertical}
          </span>

          <span
            id={`badge-freq-${dashboard.id}`}
            className="font-sans text-[11px] text-galicia-gray bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100 flex items-center gap-1 ml-auto"
          >
            <Clock className="h-3 w-3 text-neutral-400" />
            {getFrequencyLabel(updateFrequency)}
          </span>
        </div>

        {/* Title */}
        <h3 
          id={`title-${dashboard.id}`}
          className="font-sans font-bold text-lg text-galicia-dark leading-snug tracking-tight mb-2 group-hover:text-galicia-orange transition-colors"
        >
          {highlightText(name, searchQuery)}
        </h3>

        {/* Description */}
        <p 
          id={`desc-${dashboard.id}`}
          className="font-sans text-sm text-neutral-600 line-clamp-4 leading-relaxed mb-4"
        >
          {highlightText(description, searchQuery)}
        </p>

        {/* Metrics key indicators */}
        <div className="mb-2">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
            Métricas Clave
          </div>
          <div className="flex flex-wrap gap-1.5">
            {metrics.map((metric, index) => (
              <span
                key={index}
                id={`metric-${dashboard.id}-${index}`}
                className="font-sans text-xs px-2.5 py-0.5 rounded bg-neutral-50 text-neutral-700 border border-neutral-100 hover:bg-neutral-100 transition-colors"
              >
                {highlightText(metric, searchQuery)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto">
        {/* Dynamic Action Bar */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-galicia-border flex items-center gap-2">
          {/* Main Action to Power BI */}
          <a
            id={`open-link-${dashboard.id}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-galicia-orange hover:bg-galicia-orange-hover text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-sm shadow-galicia-orange/10 active:scale-[0.98]"
          >
            Abrir tablero
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Quick secondary actions inside card */}
          {isAdmin && (
            <>
              <button
                id={`admin-edit-btn-${dashboard.id}`}
                onClick={() => onEdit?.(dashboard)}
                className="p-2 border border-galicia-border hover:bg-white text-galicia-orange hover:text-galicia-orange-hover rounded-xl transition-all duration-200"
                title="Editar tablero (Admin)"
                type="button"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                id={`admin-delete-btn-${dashboard.id}`}
                onClick={() => onDelete?.(dashboard.id)}
                className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-xl transition-all duration-200"
                title="Eliminar tablero (Admin)"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
