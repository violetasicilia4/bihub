import { supabase } from './supabaseClient';
import { Dashboard } from '../types';

interface DashboardRow {
  id: string;
  name: string;
  vertical: Dashboard['vertical'];
  description: string;
  url: string;
  owner: string;
  update_frequency: Dashboard['updateFrequency'];
  status: Dashboard['status'];
  metrics: string[];
  tags: string[];
  last_updated: string | null;
  views_count: number | null;
}

function fromRow(row: DashboardRow): Dashboard {
  return {
    id: row.id,
    name: row.name,
    vertical: row.vertical,
    description: row.description,
    url: row.url,
    owner: row.owner,
    updateFrequency: row.update_frequency,
    status: row.status,
    metrics: row.metrics ?? [],
    tags: row.tags ?? [],
    lastUpdated: row.last_updated ?? undefined,
    viewsCount: row.views_count ?? undefined,
  };
}

function toRow(dash: Dashboard): Omit<DashboardRow, 'id'> & { id?: string } {
  return {
    id: dash.id,
    name: dash.name,
    vertical: dash.vertical,
    description: dash.description,
    url: dash.url,
    owner: dash.owner,
    update_frequency: dash.updateFrequency,
    status: dash.status,
    metrics: dash.metrics,
    tags: dash.tags,
    last_updated: dash.lastUpdated ?? null,
    views_count: dash.viewsCount ?? 0,
  };
}

export async function fetchDashboards(): Promise<Dashboard[]> {
  const { data, error } = await supabase
    .from('dashboards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DashboardRow[]).map(fromRow);
}

export async function upsertDashboard(dash: Dashboard): Promise<Dashboard> {
  const { data, error } = await supabase
    .from('dashboards')
    .upsert(toRow(dash))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data as DashboardRow);
}

export async function deleteDashboard(id: string): Promise<void> {
  const { error } = await supabase.from('dashboards').delete().eq('id', id);
  if (error) throw error;
}
