/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, ShieldAlert, KeyRound, Lightbulb, MessageSquarePlus } from 'lucide-react';
import { Dashboard } from '../types';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: 'access' | 'error' | 'suggest';
  dashboard?: Dashboard | null;
  allDashboards?: Dashboard[];
}

export default function RequestAccessModal({
  isOpen,
  onClose,
  initialType,
  dashboard = null,
  allDashboards = []
}: RequestAccessModalProps) {
  const [formType, setFormType] = useState<'access' | 'error' | 'suggest'>(initialType);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [errorDescription, setErrorDescription] = useState<string>('');
  const [requesterName, setRequesterName] = useState<string>('');
  const [requesterEmail, setRequesterEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sync initial parameters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormType(initialType);
      setSelectedDashboardId(dashboard ? dashboard.id : (allDashboards[0]?.id || ''));
      setJustification('');
      setErrorDescription('');
      setRequesterName('');
      setRequesterEmail('');
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen, initialType, dashboard, allDashboards]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const selectedDashboardObj = allDashboards.find(d => d.id === selectedDashboardId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop background */}
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />

        {/* Modal body container */}
        <motion.div
          id="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl border border-neutral-100 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              {formType === 'access' && <KeyRound className="h-5 w-5 text-indigo-600" id="icon-access" />}
              {formType === 'error' && <ShieldAlert className="h-5 w-5 text-amber-600" id="icon-error" />}
              {formType === 'suggest' && <Lightbulb className="h-5 w-5 text-emerald-600" id="icon-suggest" />}
              <h2 className="font-sans font-semibold text-lg text-neutral-950" id="modal-title">
                {formType === 'access' && 'Solicitar Acceso a Tablero'}
                {formType === 'error' && 'Reportar un Error / Incidencia'}
                {formType === 'suggest' && 'Sugerir Nuevo Tablero'}
              </h2>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick tab switcher within modal */}
          {!isSuccess && (
            <div className="flex border-b border-neutral-100 bg-neutral-50/20 p-1">
              <button
                id="tab-switch-access"
                type="button"
                onClick={() => setFormType('access')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  formType === 'access'
                    ? 'bg-white text-indigo-700 shadow-sm border border-neutral-200/50'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Acceso
              </button>
              <button
                id="tab-switch-error"
                type="button"
                onClick={() => setFormType('error')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  formType === 'error'
                    ? 'bg-white text-amber-700 shadow-sm border border-neutral-200/50'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Reportar Error
              </button>
              <button
                id="tab-switch-suggest"
                type="button"
                onClick={() => setFormType('suggest')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  formType === 'suggest'
                    ? 'bg-white text-emerald-700 shadow-sm border border-neutral-200/50'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Sugerir Dashboard
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  id="success-message"
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-8"
                >
                  <div className="mb-4 rounded-full bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h3 className="font-sans font-semibold text-xl text-neutral-900 mb-2">
                    ¡Solicitud enviada con éxito!
                  </h3>
                  <p className="font-sans text-sm text-neutral-600 max-w-sm mb-6">
                    {formType === 'access' && `Tu solicitud de acceso para "${selectedDashboardObj?.name || 'el tablero seleccionado'}" fue enviada al equipo de BI. Te notificaremos por mail.`}
                    {formType === 'error' && `Gracias por reportar la incidencia. El equipo de BI ya fue alertado.`}
                    {formType === 'suggest' && `¡Excelente sugerencia! Nuestro equipo de datos evaluará la viabilidad de este nuevo tablero y se pondrá en contacto pronto.`}
                  </p>
                  <button
                    id="success-close-btn"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-sans text-sm font-medium transition-colors"
                  >
                    Entendido
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Select Dashboard (Only for access and error forms) */}
                  {formType !== 'suggest' && (
                    <div>
                      <label htmlFor="dashboard-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Seleccionar Tablero
                      </label>
                      <select
                        id="dashboard-select"
                        value={selectedDashboardId}
                        onChange={(e) => setSelectedDashboardId(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800"
                        required
                      >
                        {allDashboards.map((dash) => (
                          <option key={dash.id} value={dash.id}>
                            [{dash.vertical}] {dash.name}
                          </option>
                        ))}
                      </select>
                      {selectedDashboardObj && (
                        <p className="mt-1.5 text-xs text-neutral-500 flex items-center justify-end px-1">
                          <span>Frecuencia: <strong className="text-neutral-700">{selectedDashboardObj.updateFrequency}</strong></span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Suggest a new dashboard fields */}
                  {formType === 'suggest' && (
                    <>
                      <div>
                        <label htmlFor="suggested-title" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                          Nombre Propuesto del Tablero
                        </label>
                        <input
                          id="suggested-title"
                          type="text"
                          placeholder="Ej. Análisis de márgenes de contribución B2B"
                          className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-neutral-800 placeholder-neutral-400"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="suggested-vertical" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                          Vertical de Negocio
                        </label>
                        <select
                          id="suggested-vertical"
                          className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-neutral-800"
                          required
                        >
                          <option value="Desarrollo">Desarrollo</option>
                          <option value="Retención">Retención</option>
                          <option value="Adquisición">Adquisición</option>
                          <option value="Cross equipo">Cross equipo</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Requester Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="req-name" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Tu Nombre
                      </label>
                      <input
                        id="req-name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-neutral-800 placeholder-neutral-400"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="req-email" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Email Corporativo
                      </label>
                      <input
                        id="req-email"
                        type="email"
                        placeholder="tuusuario@empresa.com"
                        value={requesterEmail}
                        onChange={(e) => setRequesterEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-neutral-800 placeholder-neutral-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Main description box based on mode */}
                  <div>
                    <label htmlFor="form-desc" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      {formType === 'access' && 'Justificación del Acceso'}
                      {formType === 'error' && 'Descripción de la Falla'}
                      {formType === 'suggest' && 'Descripción, Métricas deseadas y Objetivos'}
                    </label>
                    <textarea
                      id="form-desc"
                      rows={3}
                      value={formType === 'error' ? errorDescription : justification}
                      onChange={(e) => formType === 'error' ? setErrorDescription(e.target.value) : setJustification(e.target.value)}
                      placeholder={
                        formType === 'access'
                          ? 'Describe brevemente para qué proyectos o toma de decisiones necesitas este dashboard...'
                          : formType === 'error'
                          ? 'Por favor detalla si hay datos desactualizados, filtros rotos, visuales caídas, o si demora en cargar...'
                          : '¿Qué decisiones de negocio responderá este tablero? ¿Qué fuentes de datos de origen prevés?'
                      }
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-all text-neutral-800 placeholder-neutral-400 resize-none"
                      required
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                    <button
                      id="cancel-form-btn"
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl font-sans text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      id="submit-form-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-sans text-sm font-medium transition-all ${
                        formType === 'access'
                          ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                          : formType === 'error'
                          ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                          : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar Solicitud
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
