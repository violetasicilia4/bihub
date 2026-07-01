/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Dashboard {
  id: string;
  name: string;
  vertical: 'Desarrollo' | 'Retención' | 'Adquisición' | 'Cross equipo';
  description: string;
  url: string;
  owner: string;
  updateFrequency: 'Diaria' | 'Semanal' | 'Mensual' | 'Anual' | 'Tiempo Real' | 'Daily' | 'Weekly' | 'Monthly' | 'Annual' | 'Real-time' | 'daily' | 'weekly' | 'monthly' | 'annual' | 'real-time';
  status: 'active' | 'under review' | 'Vacated' | 'Activo' | 'En revisión' | 'Deprecated';
  metrics: string[];
  tags: string[];
  lastUpdated?: string; // Optional nice date
  viewsCount?: number;  // Optional realistic visual count
}

export type TabType = 'Todos' | 'Desarrollo' | 'Retención' | 'Adquisición' | 'Cross equipo';
