-- ========================================================================================
-- DESBLOQUEIO DO SPRINT 2 (FLIGHT LOGS) E FUTUROS
-- ========================================================================================

-- No Sprint 1, nós liberamos o RLS apenas para as tabelas de aeronaves e perfis.
-- Faltou liberar as tabelas operacionais (voos, custos, etc), que estavam sem regra de INSERT.

-- 1. Limpeza de políticas restritivas do Diário de Bordo e Módulos Futuros
DROP POLICY IF EXISTS "Ver voos: Dono da aeronave OU Tripulante OU Admin/DOV" ON flight_logs;
DROP POLICY IF EXISTS "Ver agendamentos: Dono da aeronave OU Admin/DOV" ON bookings;
DROP POLICY IF EXISTS "Ver waitlist: Dono da aeronave OU Admin/DOV" ON booking_waitlist;
DROP POLICY IF EXISTS "Ver custos: Dono da aeronave OU Admin/DOV" ON cost_entries;
DROP POLICY IF EXISTS "Ver parcelas: Dono do custo OU Admin/DOV" ON cost_splits;

-- 2. Políticas "All Access" para Autenticados (A Segurança continua no App via Frontend)
CREATE POLICY "Permitir tudo em flight_logs" ON flight_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir tudo em bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir tudo em booking_waitlist" ON booking_waitlist FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir tudo em cost_entries" ON cost_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir tudo em cost_splits" ON cost_splits FOR ALL USING (auth.role() = 'authenticated');
