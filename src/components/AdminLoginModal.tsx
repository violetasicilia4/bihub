/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (authError) {
      setError('Email o contraseña incorrectos.');
      return;
    }

    onLoginSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop background */}
        <motion.div
          id="login-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/45 backdrop-blur-sm"
        />

        {/* Modal container */}
        <motion.div
          id="login-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-neutral-100 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              <h2 className="font-sans font-semibold text-neutral-950 text-base" id="login-modal-title">
                Acceso de Administrador
              </h2>
            </div>
            <button
              id="close-login-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <p className="font-sans text-xs text-neutral-500 mb-4 leading-relaxed">
                Ingresá con tu cuenta de administradora para activar el modo de edición, borrado y creación de tableros.
              </p>

              <label htmlFor="admin-email-input" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="admin-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@dominio.com"
                className="w-full mb-3 px-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800 placeholder-neutral-400"
                required
                autoFocus
              />

              <label htmlFor="admin-pass-input" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="admin-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe la contraseña..."
                  className="w-full pl-3 pr-10 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-800 placeholder-neutral-400"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Error block */}
              {error && (
                <div className="mt-3 flex items-start gap-2 text-xs text-rose-600 bg-rose-50/50 border border-rose-100 p-2.5 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                id="cancel-login-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl font-sans text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-login-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-sans text-xs font-medium bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verificando...' : 'Ingresar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
