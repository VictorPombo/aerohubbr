-- ========================================================================================
-- AEROHUB: DATABASE SCHEMA (MVP - SPRINT 0)
-- ========================================================================================
-- Este script configura as tabelas base para a fase de MVP (Agendamentos, Rateio, Cotas).
-- ========================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================================================
-- 📦 CORE ENTITIES
-- ========================================================================================

-- 1. Empresas / Operadores
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Perfis de Usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dov', 'pilot', 'mechanic', 'owner')),
  anac_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aeronaves
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  manufacturer TEXT,
  model TEXT NOT NULL,
  type_code TEXT,
  base_airport TEXT,
  image_url TEXT,
  total_airframe_hours NUMERIC(10, 2) DEFAULT 0,
  total_engine_hours NUMERIC(10, 2) DEFAULT 0,
  total_cycles INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'maintenance', 'grounded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Multipropriedade (Cotas)
CREATE TABLE IF NOT EXISTS aircraft_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID REFERENCES aircraft(id) NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  ownership_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  monthly_hours_quota NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aircraft_id, owner_id)
);

-- ========================================================================================
-- ✈️ OPERAÇÕES & DIÁRIO DE BORDO
-- ========================================================================================

-- 5. Logbook (Diário de Bordo Eletrônico)
CREATE TABLE IF NOT EXISTS flight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID REFERENCES aircraft(id) NOT NULL,
  pic_id UUID REFERENCES profiles(id) NOT NULL,
  sic_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  engine_start TIMESTAMPTZ NOT NULL,
  takeoff TIMESTAMPTZ NOT NULL,
  landing TIMESTAMPTZ NOT NULL,
  engine_stop TIMESTAMPTZ NOT NULL,
  total_flight_hours NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'signed', 'audited')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================================
-- 📅 AGENDAMENTO
-- ========================================================================================

-- 6. Reservas
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID REFERENCES aircraft(id) NOT NULL,
  requested_by UUID REFERENCES profiles(id) NOT NULL,
  approved_by UUID REFERENCES profiles(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  origin_icao TEXT,
  destination_icao TEXT,
  purpose TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Lista de Espera
CREATE TABLE IF NOT EXISTS booking_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID REFERENCES aircraft(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  preferred_date DATE NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'notified', 'booked', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================================
-- 💰 RATEIO DE CUSTOS
-- ========================================================================================

-- 8. Lançamento de Custos
CREATE TABLE IF NOT EXISTS cost_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aircraft_id UUID REFERENCES aircraft(id) NOT NULL,
  flight_log_id UUID REFERENCES flight_logs(id),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fuel', 'maintenance', 'hangar', 'insurance', 'landing_fee', 'other')),
  total_amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  split_method TEXT NOT NULL CHECK (split_method IN ('equal', 'by_hours', 'by_percentage')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Divisão de Custos
CREATE TABLE IF NOT EXISTS cost_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cost_entry_id UUID REFERENCES cost_entries(id) NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ
);

-- ========================================================================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ========================================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_splits ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Usuários veem perfis da sua empresa" 
ON profiles FOR SELECT 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuários podem editar próprio perfil" 
ON profiles FOR UPDATE 
USING (id = auth.uid());

-- 2. Aircraft (Dono da cota OU Admin/DOV da empresa)
CREATE POLICY "Ver aeronaves: Donos da cota OU Admin/DOV"
ON aircraft FOR SELECT
USING (
  id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid()) 
  OR 
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov'))
);

-- 3. Aircraft Owners
CREATE POLICY "Ver donos: Mesma aeronave OU Admin/DOV"
ON aircraft_owners FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR
  aircraft_id IN (SELECT id FROM aircraft WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov')))
);

-- 4. Flight Logs
CREATE POLICY "Ver voos: Dono da aeronave OU Tripulante OU Admin/DOV"
ON flight_logs FOR SELECT
USING (
  pic_id = auth.uid() OR sic_id = auth.uid()
  OR aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR aircraft_id IN (SELECT id FROM aircraft WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov')))
);

-- 5. Bookings
CREATE POLICY "Ver agendamentos: Dono da aeronave OU Admin/DOV"
ON bookings FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR aircraft_id IN (SELECT id FROM aircraft WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov')))
);

-- 6. Booking Waitlist
CREATE POLICY "Ver waitlist: Dono da aeronave OU Admin/DOV"
ON booking_waitlist FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR aircraft_id IN (SELECT id FROM aircraft WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov')))
);

-- 7. Cost Entries & Splits
CREATE POLICY "Ver custos: Dono da aeronave OU Admin/DOV"
ON cost_entries FOR SELECT
USING (
  aircraft_id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid())
  OR aircraft_id IN (SELECT id FROM aircraft WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov')))
);

CREATE POLICY "Ver parcelas: Dono do custo OU Admin/DOV"
ON cost_splits FOR SELECT
USING (
  owner_id = auth.uid()
  OR cost_entry_id IN (SELECT id FROM cost_entries WHERE aircraft_id IN (SELECT id FROM aircraft WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'dov'))))
);
