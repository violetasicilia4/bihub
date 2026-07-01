/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Bookmark,
  BookmarkX,
  X,
  FilterX,
  FileSpreadsheet,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  BookmarkCheck,
  Plus,
  Undo2,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  Loader2
} from 'lucide-react';

import Header from './components/Header';
import DashboardCard from './components/DashboardCard';
import RequestAccessModal from './components/RequestAccessModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { fetchDashboards, upsertDashboard, deleteDashboard as deleteDashboardRemote } from './lib/dashboards';
import { Dashboard, TabType } from './types';

export default function App() {
  // Main state - shared across all users via Supabase
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoadingDashboards, setIsLoadingDashboards] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Favorites/Bookmarking state (personal preference, kept per-browser)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('bi_hub_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Admin Mode states - backed by a real Supabase Auth session
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminSelectedDashboard, setAdminSelectedDashboard] = useState<Dashboard | null>(null);
  const [lastDeletedDashboard, setLastDeletedDashboard] = useState<Dashboard | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'access' | 'error' | 'suggest'>('access');
  const [modalSelectedDashboard, setModalSelectedDashboard] = useState<Dashboard | null>(null);

  // Load dashboards from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoadError('Falta configurar Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
      setIsLoadingDashboards(false);
      return;
    }
    fetchDashboards()
      .then(setDashboards)
      .catch(() => setLoadError('No se pudieron cargar los tableros. Intenta recargar la página.'))
      .finally(() => setIsLoadingDashboards(false));
  }, []);

  // Track the Supabase Auth session to know if the current visitor is the admin
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Save favorites to storage
  useEffect(() => {
    localStorage.setItem('bi_hub_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite helper
  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Trigger modal helper
  const handleOpenModal = (type: 'access' | 'error' | 'suggest', dash: Dashboard | null = null) => {
    setModalType(type);
    setModalSelectedDashboard(dash);
    setIsModalOpen(true);
  };

  // Admin handlers
  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setIsAdmin(false);
  };

  const handleCreateOrUpdateDashboard = async (dash: Dashboard) => {
    setActionError(null);
    try {
      const saved = await upsertDashboard(dash);
      setDashboards(prev => {
        const exists = prev.some(d => d.id === saved.id);
        if (exists) {
          return prev.map(d => d.id === saved.id ? saved : d);
        }
        return [saved, ...prev];
      });
    } catch {
      setActionError('No se pudo guardar el tablero. Verifica tu sesión de administradora e intenta de nuevo.');
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    const toDelete = dashboards.find(d => d.id === id);
    if (!toDelete) return;

    setActionError(null);
    try {
      await deleteDashboardRemote(id);
      setLastDeletedDashboard(toDelete);
      setDashboards(prev => prev.filter(d => d.id !== id));
      // Auto clear undo-state after 10 seconds
      setTimeout(() => {
        setLastDeletedDashboard(current => current?.id === id ? null : current);
      }, 10000);
    } catch {
      setActionError('No se pudo eliminar el tablero. Verifica tu sesión de administradora e intenta de nuevo.');
    }
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedDashboard) return;
    const restored = lastDeletedDashboard;
    setLastDeletedDashboard(null);
    try {
      const saved = await upsertDashboard(restored);
      setDashboards(prev => {
        if (prev.some(d => d.id === saved.id)) return prev;
        return [saved, ...prev];
      });
    } catch {
      setActionError('No se pudo restaurar el tablero.');
    }
  };

  const handleOpenCreateModal = () => {
    setAdminSelectedDashboard(null);
    setIsAdminModalOpen(true);
  };

  const handleOpenEditModal = (dash: Dashboard) => {
    setAdminSelectedDashboard(dash);
    setIsAdminModalOpen(true);
  };

  // Reset all filters helper
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveTab('Todos');
  };

  // Filter computation logic (Memoized)
  const filteredDashboards = useMemo(() => {
    return dashboards.filter(dash => {
      // 1. Tab / Solapa Filter
      if (activeTab !== 'Todos' && dash.vertical !== activeTab) {
        return false;
      }

      // 2. Text Search Query Filter (Matches Name, Description, Owner, Vertical, Metrics, Tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery = 
          dash.name.toLowerCase().includes(query) ||
          dash.description.toLowerCase().includes(query) ||
          dash.owner.toLowerCase().includes(query) ||
          dash.vertical.toLowerCase().includes(query) ||
          dash.metrics.some(m => m.toLowerCase().includes(query)) ||
          dash.tags.some(t => t.toLowerCase().includes(query));
        
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [dashboards, activeTab, searchQuery]);

  // Separate favorites vs other items for nice priority display
  const { pinnedItems, regularItems } = useMemo(() => {
    const pinned: Dashboard[] = [];
    const regular: Dashboard[] = [];

    filteredDashboards.forEach(item => {
      if (favorites.includes(item.id)) {
        pinned.push(item);
      } else {
        regular.push(item);
      }
    });

    return { pinnedItems: pinned, regularItems: regular };
  }, [filteredDashboards, favorites]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = dashboards.length;
    const active = dashboards.filter(d => d.status.toLowerCase() === 'activo' || d.status.toLowerCase() === 'active').length;
    const inReview = dashboards.filter(d => d.status.toLowerCase() === 'en revisión' || d.status.toLowerCase() === 'under review').length;
    const devCount = dashboards.filter(d => d.vertical === 'Desarrollo').length;
    const retCount = dashboards.filter(d => d.vertical === 'Retención').length;
    const acqCount = dashboards.filter(d => d.vertical === 'Adquisición').length;
    const crossCount = dashboards.filter(d => d.vertical === 'Cross equipo').length;

    return { total, active, inReview, devCount, retCount, acqCount, crossCount };
  }, [dashboards]);

  const tabsList: { value: TabType; count: number }[] = [
    { value: 'Todos', count: dashboards.length },
    { value: 'Desarrollo', count: stats.devCount },
    { value: 'Retención', count: stats.retCount },
    { value: 'Adquisición', count: stats.acqCount },
    { value: 'Cross equipo', count: stats.crossCount }
  ];

  return (
    <div className="min-h-screen bg-galicia-bg text-galicia-dark selection:bg-galicia-orange selection:text-white flex flex-col">
      
      {/* Header component */}
      <Header 
        totalCount={dashboards.length} 
        onOpenModal={(type) => handleOpenModal(type)} 
        isAdmin={isAdmin}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        


        {/* CONTAINER CON CONTENEDOR GRANDE Y BORDES REDONDEADOS */}
        <div className="bg-white rounded-3xl border border-galicia-border border-t-4 border-t-galicia-orange shadow-xl shadow-neutral-200/20 p-6 sm:p-8 md:p-10 mb-8">
          
          {/* SEARCH & FILTERS DOCK */}
          <div className="mb-8 pb-6 border-b border-galicia-border">
            
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-galicia-orange">
                <Search className="h-5 w-5" />
              </div>
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tablero, métrica, equipo o palabra clave..."
                className="w-full pl-11 pr-11 py-4 bg-white hover:bg-neutral-50/50 focus:bg-white border-2 border-galicia-border hover:border-galicia-orange/30 focus:border-galicia-orange rounded-2xl font-sans text-sm focus:outline-none focus:ring-4 focus:ring-galicia-orange/10 transition-all text-galicia-dark placeholder-neutral-400 font-medium"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-galicia-dark"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* SOLAPAS / TABS NAVEGACIÓN */}
          <div className="mb-6">
            <div className="border-b border-galicia-border pb-4">
              <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                {tabsList.map((tab) => {
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      id={`tab-navigation-${tab.value}`}
                      onClick={() => setActiveTab(tab.value)}
                      className={`font-sans text-xs sm:text-sm font-bold py-2 px-4 rounded-xl border whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? 'bg-galicia-dark border-galicia-dark text-white shadow-sm'
                          : 'bg-neutral-50 border-galicia-border text-galicia-gray hover:text-galicia-dark hover:bg-neutral-100 hover:border-neutral-350'
                      }`}
                      type="button"
                    >
                      {tab.value}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive 
                          ? 'bg-galicia-orange text-white' 
                          : 'bg-neutral-200/70 text-galicia-gray'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* RESULTS SUMMARY BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-6 text-sm text-neutral-500 font-sans bg-neutral-50/30 p-2 px-3 rounded-lg">
            <div className="flex flex-wrap items-center gap-x-2">
              <span>
                Se encontraron <strong className="text-neutral-800 font-semibold">{filteredDashboards.length}</strong> de {dashboards.length} tableros
              </span>
              {searchQuery && (
                <span className="text-neutral-400 font-light">
                  • coincidentes con <strong className="text-neutral-700 font-medium">"{searchQuery}"</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              {(searchQuery || activeTab !== 'Todos') && (
                <button
                  id="clear-all-filters-btn"
                  onClick={handleClearFilters}
                  className="font-sans text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer mr-2"
                  type="button"
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* ADMIN CONTROL BAR */}
          {isAdmin && (
            <motion.div
              id="admin-controls-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Unlock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-indigo-950 text-sm leading-tight">
                    Consola de Edición BI Hub
                  </h4>
                  <p className="text-xs text-indigo-800">
                    Puedes agregar, editar y eliminar tableros corporativos. Los cambios se guardan en la base de datos y los ve todo tu equipo.
                  </p>
                </div>
              </div>

              <button
                id="admin-add-dashboard-btn"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer hover:shadow active:scale-[0.98] shrink-0"
                type="button"
              >
                <Plus className="h-4 w-4" />
                Registrar Tablero
              </button>
            </motion.div>
          )}

          {/* ACTION ERROR BANNER (save/delete/restore failures) */}
          {actionError && (
            <motion.div
              id="action-error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span className="font-sans text-xs text-rose-800">{actionError}</span>
              </div>
              <button
                id="dismiss-action-error-btn"
                onClick={() => setActionError(null)}
                className="text-rose-600 hover:text-rose-800"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* UNDO DELETION TOAST / NOTIFICATION BANNER */}
          {lastDeletedDashboard && (
            <motion.div
              id="undo-delete-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="h-5 w-5 text-rose-400 shrink-0" />
                <span className="font-sans text-xs">
                  Tablero <strong className="text-neutral-100">"{lastDeletedDashboard.name}"</strong> eliminado de forma segura.
                </span>
              </div>
              <button
                id="undo-delete-btn"
                onClick={handleUndoDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-sans text-xs font-semibold transition-all cursor-pointer"
                type="button"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Deshacer
              </button>
            </motion.div>
          )}

          {/* DYNAMIC CARDS GRID */}
          {isLoadingDashboards ? (
            <div id="dashboards-loading-view" className="flex flex-col items-center justify-center text-center py-16 px-4 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="font-sans text-sm">Cargando tableros...</p>
            </div>
          ) : loadError ? (
            <div id="dashboards-error-view" className="flex flex-col items-center justify-center text-center py-16 px-4 bg-rose-50/40 rounded-2xl border border-dashed border-rose-200">
              <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
              <h3 className="font-sans font-semibold text-neutral-950 text-base mb-1">
                No se pudieron cargar los tableros
              </h3>
              <p className="font-sans text-sm text-neutral-500 max-w-md">{loadError}</p>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            {filteredDashboards.length === 0 ? (
              <motion.div
                id="empty-state-view"
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center text-center py-16 px-4 bg-neutral-50/20 rounded-2xl border border-dashed border-neutral-200"
              >
                <div className="h-12 w-12 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-4">
                  <FilterX className="h-6 w-6" />
                </div>
                <h3 className="font-sans font-semibold text-neutral-950 text-base mb-1">
                  No encontramos tableros con ese criterio.
                </h3>
                <p className="font-sans text-sm text-neutral-500 max-w-md mb-6">
                  Prueba modificando los términos del buscador, quitando filtros rápidos, o cambiando de solapa.
                </p>
                <button
                  id="reset-search-btn-empty"
                  onClick={handleClearFilters}
                  className="px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-sans text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                  type="button"
                >
                  Restablecer todos los filtros
                </button>
              </motion.div>
            ) : (
              <motion.div
                id="dashboards-grid-wrapper"
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDashboards.map((dash) => (
                    <div key={dash.id} className="relative">
                      <DashboardCard
                        dashboard={dash}
                        onRequestAccess={(d) => handleOpenModal('access', d)}
                        onRequestError={(d) => handleOpenModal('error', d)}
                        searchQuery={searchQuery}
                        isAdmin={isAdmin}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteDashboard}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          )}

        </div>



      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-neutral-400 font-sans border-t border-galicia-border max-w-[1440px] mx-auto w-full px-4 mt-8 shrink-0">
      </footer>

      {/* SUPPORT & REQUEST MODAL */}
      <RequestAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
        dashboard={modalSelectedDashboard}
        allDashboards={dashboards}
      />

      {/* ADMIN LOGINS & MANAGE MODALS */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        dashboard={adminSelectedDashboard}
        onSave={handleCreateOrUpdateDashboard}
      />

    </div>
  );
}
