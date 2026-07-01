/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, BarChart3, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { Dashboard } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: Dashboard | null; // null means we are adding a new dashboard
  onSave: (dash: Dashboard) => void;
}

export default function AdminDashboardModal({
  isOpen,
  onClose,
  dashboard,
  onSave
}: AdminDashboardModalProps) {
  const [name, setName] = useState<string>('');
  const [vertical, setVertical] = useState<'Desarrollo' | 'Retención' | 'Adquisición' | 'Cross equipo'>('Desarrollo');
  const [description, setDescription] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [updateFrequency, setUpdateFrequency] = useState<Dashboard['updateFrequency']>('daily');
  const [metricsText, setMetricsText] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Synchronize state when opening / switching dashboard
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (dashboard) {
        // Edit mode
        setName(dashboard.name);
        setVertical(dashboard.vertical);
        setDescription(dashboard.description);
        setUrl(dashboard.url);

        // Map Spanish values to the new standard to align with select dropdowns
        let f = dashboard.updateFrequency;
        if (f === 'Diaria') f = 'daily';
        else if (f === 'Semanal') f = 'weekly';
        else if (f === 'Mensual') f = 'monthly';
        else if (f === 'Anual') f = 'annual';
        else if (f === 'Tiempo Real') f = 'real-time';
        setUpdateFrequency(f);

        setMetricsText(dashboard.metrics.join(', '));
        setTagsText(dashboard.tags.join(', '));
      } else {
        // Add mode
        setName('');
        setVertical('Desarrollo');
        setDescription('');
        setUrl('https://app.powerbi.com/view?r=');
        setUpdateFrequency('daily');
        setMetricsText('');
        setTagsText('');
      }
    }
  }, [isOpen, dashboard]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quick validations
    if (!name.trim()) {
      setError('El nombre del tablero es requerido.');
      return;
    }
    if (!description.trim()) {
      setError('La descripción es requerida.');
      return;
    }
    if (!url.trim() || !url.startsWith('http')) {
      setError('Ingresa un link directo de Power BI Cloud válido (debe empezar con http:// o https://).');
      return;
    }

    // Parse metrics and tags
    const metrics = metricsText
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const tags = tagsText
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    // Create the final dashboard object
    const finalDashboard: Dashboard = {
      id: dashboard ? dashboard.id : `dash-${Date.now()}`,
      name: name.trim(),
      vertical,
      description: description.trim(),
      url: url.trim(),
      updateFrequency,
      metrics: metrics.length > 0 ? metrics : ['General'],
      tags: tags.length > 0 ? tags : [vertical.toLowerCase().replace(' ', '')],
      lastUpdated: dashboard ? (dashboard.lastUpdated || 'Hace momentos') : 'Recién creado',
      viewsCount: dashboard ? (dashboard.viewsCount || 10) : 0
    };

    onSave(finalDashboard);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop background */}
        <motion.div
          id="admin-dashboard-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />

        {/* Modal body container */}
        <motion.div
          id="admin-dashboard-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-150 z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h2 className="font-sans font-semibold text-neutral-950 text-base" id="admin-modal-title">
                {dashboard ? 'Editar Tablero Corporativo' : 'Registrar Nuevo Tablero Power BI'}
              </h2>
            </div>
            <button
              id="close-admin-dash-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scroll Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-grow">
            
            {/* Error box */}
            {error && (
              <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dash-name" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Nombre del Tablero
                </label>
                <input
                  id="dash-name"
                  type="text"
                  placeholder="Ej. Análisis de riesgo de fuga de clientes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800"
                  required
                />
              </div>

              <div>
                <label htmlFor="dash-vertical" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Vertical de Negocio / Solapa
                </label>
                <select
                  id="dash-vertical"
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800"
                >
                  <option value="Desarrollo">Desarrollo</option>
                  <option value="Retención">Retención</option>
                  <option value="Adquisición">Adquisición</option>
                  <option value="Cross equipo">Cross equipo</option>
                </select>
              </div>
            </div>

            {/* Description Text area */}
            <div>
              <label htmlFor="dash-desc" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Descripción Corta (Max 2 líneas en tarjeta)
              </label>
              <textarea
                id="dash-desc"
                rows={2}
                placeholder="Explica qué problemas responde este tablero y quiénes se benefician de él."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800 resize-none"
                required
              />
            </div>

            {/* Power BI Cloud link URL */}
            <div>
              <label htmlFor="dash-url" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Enlace Directo a Power BI Cloud
              </label>
              <input
                id="dash-url"
                type="text"
                placeholder="https://app.powerbi.com/groups/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800"
                required
              />
              <p className="mt-1 text-[10px] text-neutral-400">
                Asegúrate de que el enlace tenga los permisos correctos en el tenant de tu equipo.
              </p>
            </div>

            {/* Update frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dash-freq" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Actualización
                </label>
                <select
                  id="dash-freq"
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800"
                >
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="annual">annual</option>
                  <option value="real-time">real-time</option>
                </select>
              </div>
            </div>

            {/* Metrics and Tags arrays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dash-metrics" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Métricas Clave (Separadas por coma)
                </label>
                <input
                  id="dash-metrics"
                  type="text"
                  placeholder="Ej. Churn, Actividad, Segmento, Campañas"
                  value={metricsText}
                  onChange={(e) => setMetricsText(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800 placeholder-neutral-400"
                />
              </div>

              <div>
                <label htmlFor="dash-tags" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Tags de Búsqueda (Separados por coma)
                </label>
                <input
                  id="dash-tags"
                  type="text"
                  placeholder="Ej. clientes, fuga, retención, fidelidad"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800 placeholder-neutral-400"
                />
              </div>
            </div>

          </form>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
            <button
              id="cancel-admin-dash-btn-footer"
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 rounded-xl font-sans text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              id="submit-admin-dash-btn"
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white font-sans text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 shadow-sm transition-all"
            >
              <Save className="h-4 w-4" />
              {dashboard ? 'Guardar Cambios' : 'Crear Tablero'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
