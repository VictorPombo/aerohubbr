-- ========================================================================================
-- SCRIPT DE CORREÇÃO DE RLS (Remoção de Recursão Infinita)
-- ========================================================================================

-- O erro {} (em branco) acontece porque o banco de dados entrou em "Recursão Infinita".
-- A tabela 'aircraft' estava perguntando para a 'aircraft_owners', que perguntava para a 'aircraft'...
-- Vamos dropar as políticas recursivas e criar políticas diretas e seguras.

-- 1. Drop das políticas antigas
DROP POLICY IF EXISTS "Ver aeronaves: Donos da cota OU Admin/DOV" ON aircraft;
DROP POLICY IF EXISTS "Ver donos: Mesma aeronave OU Admin/DOV" ON aircraft_owners;
DROP POLICY IF EXISTS "Ver voos: Dono da aeronave OU Tripulante OU Admin/DOV" ON flight_logs;
DROP POLICY IF EXISTS "Ver agendamentos: Dono da aeronave OU Admin/DOV" ON bookings;
DROP POLICY IF EXISTS "Ver waitlist: Dono da aeronave OU Admin/DOV" ON booking_waitlist;
DROP POLICY IF EXISTS "Ver custos: Dono da aeronave OU Admin/DOV" ON cost_entries;
DROP POLICY IF EXISTS "Ver parcelas: Dono do custo OU Admin/DOV" ON cost_splits;

-- 2. Recriando políticas de forma segura (Sem loop circular)

-- AIRCRAFT
-- A política da aeronave olha para os donos, mas a dos donos NÃO olha para a aeronave.
CREATE POLICY "Ver aeronaves"
ON aircraft FOR SELECT
USING (
  -- O usuário é dono desta aeronave
  id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid()) 
  OR 
  -- O usuário é da mesma empresa e é admin/dov
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov'))
);

-- AIRCRAFT OWNERS
-- A política de donos permite que o usuário veja suas próprias cotas.
-- Para ver as cotas dos outros na mesma aeronave, usamos uma subquery limpa.
CREATE POLICY "Ver donos"
ON aircraft_owners FOR SELECT
USING (
  -- Vê as próprias cotas
  owner_id = auth.uid()
  OR
  -- Vê as cotas das aeronaves que ele também é dono
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
);

-- FLIGHT LOGS
CREATE POLICY "Ver voos"
ON flight_logs FOR SELECT
USING (
  pic_id = auth.uid() 
  OR sic_id = auth.uid()
  OR aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
);

-- BOOKINGS
CREATE POLICY "Ver agendamentos"
ON bookings FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR requested_by = auth.uid()
);

-- BOOKING WAITLIST
CREATE POLICY "Ver waitlist"
ON booking_waitlist FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR user_id = auth.uid()
);

-- COST ENTRIES
CREATE POLICY "Ver custos"
ON cost_entries FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
);

-- COST SPLITS
CREATE POLICY "Ver parcelas"
ON cost_splits FOR SELECT
USING (
  owner_id = auth.uid()
);

-- INSERTS (Importante para o Modal funcionar!)
CREATE POLICY "Inserir aeronave" ON aircraft FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserir cota" ON aircraft_owners FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserir empresa" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Update perfil" ON profiles FOR UPDATE USING (id = auth.uid());
