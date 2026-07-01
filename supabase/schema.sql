-- Adyr BI Hub - esquema de base de datos
-- Ejecutar este script completo en Supabase: Project > SQL Editor > New query > Run

-- 1. Tabla de tableros (dashboards) ------------------------------------------------

create table if not exists public.dashboards (
  id text primary key,
  name text not null,
  vertical text not null check (vertical in ('Desarrollo', 'Retención', 'Adquisición', 'Cross equipo')),
  description text not null,
  url text not null,
  owner text not null,
  update_frequency text not null,
  status text not null,
  metrics text[] not null default '{}',
  tags text[] not null default '{}',
  last_updated text,
  views_count integer default 0,
  created_at timestamptz not null default now()
);

-- 2. Seguridad a nivel de fila (RLS) -----------------------------------------------
-- Cualquiera con la URL de la app puede LEER los tableros (solo lectura, público).
-- Únicamente cuentas autenticadas pueden crear, editar o borrar tableros. Como la
-- app no tiene un formulario público de registro, la única forma de tener una cuenta
-- es que la administradora la cree a mano en Authentication > Users, así que "estar
-- autenticado" equivale a "ser admin".

alter table public.dashboards enable row level security;

drop policy if exists "Cualquiera puede leer tableros" on public.dashboards;
create policy "Cualquiera puede leer tableros"
  on public.dashboards
  for select
  using (true);

drop policy if exists "Solo admin puede insertar tableros" on public.dashboards;
create policy "Solo admin puede insertar tableros"
  on public.dashboards
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Solo admin puede editar tableros" on public.dashboards;
create policy "Solo admin puede editar tableros"
  on public.dashboards
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Solo admin puede borrar tableros" on public.dashboards;
create policy "Solo admin puede borrar tableros"
  on public.dashboards
  for delete
  using (auth.role() = 'authenticated');

-- 3. Datos iniciales (seed) --------------------------------------------------------
-- Se insertan solo si la tabla está vacía, para no duplicar en re-ejecuciones.

insert into public.dashboards (id, name, vertical, description, url, owner, update_frequency, status, metrics, tags, last_updated, views_count)
select * from (values
  ('retencion-001', 'Riesgo de fuga clientes', 'Retención', 'Identifica clientes con señales tempranas de abandono y permite monitorear la efectividad de las acciones de retención automatizadas.', 'https://app.powerbi.com/view?r=eyJRIjoiaHR0cHM6Ly9hcHAucG93ZXJiaS5jb20iLCJUaWQiOiJmYWtlX3RlbWFudCJ9', 'Equipo Retención', 'Diaria', 'Activo', array['Churn','Actividad','Segmento','Campañas'], array['clientes','fuga','retención','churn','prevención'], 'Hace 4 horas', 342),
  ('adquisicion-001', 'Altas por canal', 'Adquisición', 'Permite analizar altas, canales de origen (SEO, SEM, Referidos) y la evolución de captación neta por período.', 'https://app.powerbi.com/view?r=eyJSZXN1bWVuIjpIYWx0YXNDYW5hbCJ9', 'Equipo Adquisición', 'Semanal', 'Activo', array['Altas','Canal','Conversión','CAC'], array['altas','canales','captación','performance'], 'Ayer, 18:30', 512),
  ('desarrollo-001', 'Performance de cartera', 'Desarrollo', 'Monitorea la evolución de cuentas activas, performance mensual de facturación y oportunidades de crecimiento de up-selling.', 'https://app.powerbi.com/view?r=eyJDYXJ0ZXJhIjpQZXJmb3JtYW5jZSJ9', 'Equipo Desarrollo', 'Mensual', 'Activo', array['Cartera','Performance','Evolución','Objetivos'], array['cartera','crecimiento','performance','ventas','mensual'], 'Hace 3 días', 189),
  ('cross-001', 'Resumen ejecutivo', 'Cross equipo', 'Vista transversal de alta dirección con indicadores clave agregados (KPIs de negocio, satisfacción general y EBITDA).', 'https://app.powerbi.com/view?r=eypFeGVjdXRpdmUiOiJSZXN1bWVuIn0=', 'BI Team', 'Diaria', 'Activo', array['KPIs','Clientes','Evolución','Negocio'], array['ejecutivo','cross','kpis','general','directorio'], 'Hace 2 horas', 1205),
  ('retencion-002', 'LTV y Cohortes de Churn', 'Retención', 'Análisis de tiempo de vida del cliente (Lifetime Value) segmentado por cohorte mensual de registro y tipo de suscripción.', 'https://app.powerbi.com/view?r=eyJMVEZDb2hvcnRlcyI6IlJldGVuY2lvbiJ9', 'Growth Analytics', 'Semanal', 'Activo', array['LTV','Cohortes','Permanencia','Suscripción'], array['clientes','cohortes','ltv','retención','finanzas'], 'Hace 1 día', 267),
  ('adquisicion-002', 'Embudo de conversión Web', 'Adquisición', 'Monitoreo del tráfico del sitio web, tasa de conversión por etapa del embudo y puntos de fuga en el flujo de registro.', 'https://app.powerbi.com/view?r=eyJFbWJ1ZG8iOiJDb252ZXJzaW9uIn0=', 'Marketing Digital', 'Diaria', 'Activo', array['Tráfico','Conversión','Fuga','Signups'], array['web','conversión','campañas','embudo','analytics'], 'Hace 1 hora', 489),
  ('adquisicion-003', 'Performance de Campañas Paid', 'Adquisición', 'Métricas consolidadas de inversión publicitaria en Google Ads, Meta Ads y LinkedIn Ads versus retorno de inversión (ROAS).', 'https://app.powerbi.com/view?r=eyJDYW1wYWduYXMiOiJQYWlkIn0=', 'Marketing Digital', 'Diaria', 'Activo', array['Inversión','ROAS','CPA','Clicks'], array['campañas','paid','google','meta','performance','inversión'], 'Hace 30 mins', 610),
  ('desarrollo-002', 'Evolución de ARPU mensual', 'Desarrollo', 'Evolución del ingreso promedio por usuario (ARPU) clasificado por industria, segmento comercial y plan contratado.', 'https://app.powerbi.com/view?r=eyJBUlBVIjpFdm9sdWNpb24ifQ==', 'Equipo Desarrollo', 'Mensual', 'Activo', array['ARPU','Ingresos','Segmento','Planes'], array['arpu','ingresos','mensual','desarrollo','rentabilidad'], 'Hace 5 días', 142),
  ('desarrollo-003', 'Performance Ventas Latam', 'Desarrollo', 'Desempeño del equipo comercial regional, porcentaje de cumplimiento de cuotas de ventas individuales y pipeline de negocios.', 'https://app.powerbi.com/view?r=eyJMYXRhbSI6IlZlbnRhcyJ9', 'Sales Operations', 'Diaria', 'En revisión', array['Ventas','Pipeline','Cuotas','Vendedores'], array['ventas','latam','desarrollo','performance','comercial'], 'Ayer, 09:00', 304),
  ('cross-002', 'NPS y Satisfacción de Cliente', 'Cross equipo', 'Consolidado de encuestas NPS mensuales, CSAT de soporte y principales temáticas de reclamo categorizadas por IA.', 'https://app.powerbi.com/view?r=eyJOUFMiOiJTYXRpc2ZhY2Npb24ifQ==', 'Customer Success', 'Semanal', 'Activo', array['NPS','CSAT','Soporte','Fidelidad'], array['clientes','nps','satisfacción','soporte','cross'], 'Hace 2 días', 422),
  ('cross-003', 'Uso y Adopción de Plataforma', 'Cross equipo', 'Métricas de adopción de funcionalidades clave del software, usuarios activos diarios/mensuales (DAU/MAU) y stickiness.', 'https://app.powerbi.com/view?r=eyJBY29wY2lvbiI6IlBsYXRhZm9ybWEifQ==', 'Product Management', 'Diaria', 'Activo', array['DAU','MAU','Engagement','Features'], array['producto','adopción','stickiness','usuarios','cross'], 'Hace 12 horas', 730),
  ('retencion-003', 'Salud de Cuenta & Alertas Early', 'Retención', 'Sistema de scoring de salud de clientes B2B que alerta proactivamente sobre cuentas en riesgo según inactividad prolongada.', 'https://app.powerbi.com/view?r=eyJTYWx1ZCI6IkFsdWVydGFzIn0=', 'Customer Success', 'Tiempo Real', 'En revisión', array['Health Score','Alertas','Interacción','Riesgo'], array['alertas','salud','b2b','retención','tiempo real'], 'En tiempo real', 524),
  ('cross-004', 'Costos de Infraestructura Cloud', 'Cross equipo', 'Consumo consolidado de servidores, bases de datos e infraestructura GCP, AWS y Azure con proyección de presupuestos anuales.', 'https://app.powerbi.com/view?r=eyJDb3N0b3MiOiJJbmZyYWEifQ==', 'DevOps & SRE', 'Mensual', 'Deprecated', array['Costos Cloud','Presupuesto','Servidores','FinOps'], array['costos','cloud','infraestructura','finops','devops'], 'Hace 1 mes', 95)
) as seed(id, name, vertical, description, url, owner, update_frequency, status, metrics, tags, last_updated, views_count)
where not exists (select 1 from public.dashboards limit 1);
