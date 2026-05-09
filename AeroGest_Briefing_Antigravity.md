# AeroGest — Briefing Técnico Antigravity

> **Produto:** SaaS de gestão para aviação geral e táxi aéreo brasileiro
> **Stack:** Next.js 15 · Supabase · Vercel · TypeScript
> **Versão:** 1.0 — Maio 2026

---

## 1. Visão geral

SaaS que unifica diário de bordo digital ANAC + agendamento multiproprietário + controle de aeronaves + comunicação operacional. Diferencial: registro de voo dispara cadeia automática (atualiza horas → recalcula manutenção → ajusta cotas → notifica proprietários).

### Módulos

| ID | Nome | Função | Prioridade |
|----|------|--------|------------|
| M1 | Diário de Bordo (eDB) | Registro ANAC, PDF, assinatura digital, trilha imutável | CRÍTICO — base |
| M2 | Agendamento | Calendário compartilhado, cotas por dono, conflito, lista de espera | ALTO — Sprint 2 |
| M3 | Controle Aeronaves | Horas, alertas manutenção, status realtime, custo/hora | ALTO — Sprint 2 |
| M4 | Comunicação Regional | Canais por assunto, avisos auto, rede hangares, marketplace | MÉDIO — Sprint 3 |

### Perfis de usuário

| Perfil | Quem | Permissões | Módulos |
|--------|------|------------|---------|
| Piloto | Registra voos | Criar/assinar eDB, ver agenda e horas | M1, M2(leitura), M3(leitura) |
| Proprietário Ativo | Dono que voa | Piloto + reservar, ver cota, aprovar manutenção | M1, M2, M3 |
| Proprietário Investidor | Dono que não voa | Financeiro, sublocar horas, relatórios | M2(financeiro), M3(leitura), M4 |
| Gestor de Frota | Admin (escola/táxi) | Configurar aeronaves, regras cota, aprovar registros | Todos |
| Super Admin | Equipe AeroGest | Acesso total, suporte, analytics | Todos |

---

## 2. Arquitetura técnica

### Stack

| Camada | Tech | Motivo |
|--------|------|--------|
| Frontend | Next.js 15 App Router + TS | SSR, rotas dinâmicas, mobile-first |
| UI | Tailwind + shadcn/ui | Componentes consistentes, dark mode |
| Backend | Supabase (Postgres + Auth + Realtime + Storage) | Multi-tenant RLS, realtime, storage PDFs |
| Auth | Supabase Auth + RLS | Controle granular por perfil e aeronave |
| PDF | react-pdf / @react-pdf/renderer | eDB padrão ANAC |
| Assinatura | crypto-js + SHA-256 + timestamp imutável | Não-repúdio. Fase avançada: ICP-Brasil |
| Notificações | Supabase Realtime + Web Push (PWA) | Alertas manutenção, agenda, voos |
| Offline | PWA + Service Worker + IndexedDB | Piloto preenche sem internet |
| Deploy | Vercel + Supabase Cloud | CI/CD auto, edge functions |

### Multi-tenant — conceito central

Cada aeronave = tenant de dados (`aircraft_id`). Proprietários são membros vinculados. Troca de dono = troca de membro, histórico intacto. RLS isola dados entre aeronaves.

- Todas as tabelas têm `aircraft_id` como FK
- RLS valida membership ativa na aeronave
- Super Admin bypassa via `service_role` key (Server Actions apenas)

### Estrutura de pastas

```
app/
  (auth)/              → login, register, forgot-password
  (dashboard)/
    layout.tsx         → sidebar + header
    page.tsx           → home (lista aeronaves)
    aircraft/
      [id]/
        page.tsx       → painel da aeronave
        logbook/       → M1
          page.tsx     → lista voos
          new/         → form novo voo
          [flightId]/  → detalhe + PDF
        schedule/      → M2
        maintenance/   → M3
        members/       → gestão proprietários
        settings/
  admin/               → Super Admin

components/
  aircraft/    logbook/    schedule/    maintenance/

lib/
  supabase/    pdf/    notifications/

types/
  database.types.ts
```

---

## 3. Schema do banco (Supabase/PostgreSQL)

> Criar na ordem listada, respeitar FKs. RLS em todas as tabelas. Policies ANTES de testar frontend.

### Tabelas principais

**profiles**
`id` (uuid FK auth.users), `full_name`, `canac`, `role`, `avatar_url`
Criada via trigger `on_auth_user_created`.

**aircraft**
`id`, `registration` (PT-XXX), `model`, `type` (airplane│helicopter), `year`, `owner_org_id`
Tipo define campos rastreados.

**aircraft_members**
`aircraft_id`, `user_id`, `role` (pilot│owner_active│owner_investor│manager), `monthly_quota_hours`, `active`
Base de todas as RLS policies. Usuário pode ter papéis diferentes por aeronave.

**flight_logs**
`id`, `aircraft_id`, `pilot_id`, `departure_time`, `arrival_time`, `hours_flown`, `origin_icao`, `destination_icao`, `fuel_used`, `occurrence`, `aircraft_condition`, `digital_signature`, `hash`, `pdf_url`
Imutável após assinatura. Trigger atualiza `aircraft_hours`.

**aircraft_hours**
`aircraft_id`, `airframe_hours`, `engine_hours`, `prop_hours`, `main_rotor_hours`, `tail_rotor_hours`, `gearbox_hours`, `updated_at`
Atualizado via trigger ao inserir flight_log.

**maintenance_items**
`id`, `aircraft_id`, `type` (50h│100h│TBO│annual│document), `component`, `threshold_hours`, `alert_at_hours`, `last_done_at_hours`, `next_due_hours`, `status`, `notes`
Status calculado dinamicamente vs aircraft_hours.

**bookings**
`id`, `aircraft_id`, `member_id`, `start_at`, `end_at`, `status` (pending│confirmed│cancelled), `hours_reserved`, `notes`
Check de conflito via função DB ou server action antes do insert.

**notifications**
`id`, `user_id`, `aircraft_id`, `type`, `title`, `body`, `read`, `created_at`

**audit_logs**
`id`, `table_name`, `record_id`, `action`, `changed_by`, `changed_at`, `old_data`, `new_data`
Trigger em todas as tabelas sensíveis. Imutável.

### Triggers (criar antes de testar frontend)

1. **on_auth_user_created** → INSERT profiles (role='pilot')
2. **on_flight_log_inserted** → UPDATE aircraft_hours (soma hours_flown) + recalcula next_due em maintenance_items
3. **on_maintenance_hours_change** → INSERT notifications para todos aircraft_members quando (next_due - current) <= alert_at
4. **on_booking_confirmed** → UPDATE aircraft_members (debita cota mensal)
5. **on_any_sensitive_write** → INSERT audit_logs (flight_logs, aircraft_hours, maintenance_items)

---

## 4. Sprints — ordem exata de execução

> Cada bloco depende do anterior. NÃO pular etapas.

### Sprint 0 — Fundação (Semana 1)

| # | Tarefa | Resultado |
|---|--------|-----------|
| 0.1 | Criar projeto Next.js 15 + TS + Tailwind + shadcn/ui | Estrutura base |
| 0.2 | Configurar Supabase + `supabase gen types` | database.types.ts gerado |
| 0.3 | Criar TODAS tabelas com migrations numeradas | supabase/migrations/001_, 002_... |
| 0.4 | RLS em todas tabelas + policies de profiles e aircraft_members | Sem RLS = dados expostos. Não avançar sem isso. |
| 0.5 | Supabase Auth: /login, /register, /forgot-password + middleware | Dashboard protegido |
| 0.6 | Trigger on_auth_user_created → INSERT profiles | Registro cria perfil auto |
| 0.7 | Layout dashboard: sidebar + header + mobile nav + lista aeronaves | Shell visual funcional |
| 0.8 | Deploy Vercel com env vars | URL pública com auth e2e |

### Sprint 1 — M1: Diário de Bordo (Semanas 2-4)

| # | Tarefa | Resultado |
|---|--------|-----------|
| 1.1 | Cadastro aeronave: matrícula, modelo, tipo, ano | aircraft + aircraft_hours zerado + maintenance_items padrão |
| 1.2 | Painel /aircraft/[id]: horas + status + últimos voos | Hub central |
| 1.3 | Form novo voo com campos ANAC (Portarias 2.050/2018, 3.220/2019, 14.096/2024) | CANAC, horários, horas, ICAO, combustível, ocorrências, situação técnica |
| 1.4 | Assinatura: SHA-256 (aircraft_id + pilot_id + departure + hours) + timestamp | locked:true após assinar, sem UPDATE via RLS |
| 1.5 | Trigger on_flight_log_inserted → UPDATE aircraft_hours | Horas atualizam auto |
| 1.6 | Gerador PDF padrão ANAC: campos + logo + hash no rodapé | PDF de /logbook/[flightId] |
| 1.7 | Lista voos paginada com filtros data/piloto/rota | Histórico completo |
| 1.8 | Offline: Service Worker + IndexedDB + sync | PWA funcional |

### Sprint 2 — M2+M3: Agenda + Controle (Semanas 5-8)

| # | Tarefa | Resultado |
|---|--------|-----------|
| 2.1 | Gestão membros: listar, convidar email, papel, cota | aircraft_members populado |
| 2.2 | Calendário /schedule: visão mensal/semanal | Slots e bloqueios visíveis |
| 2.3 | Criar reserva: check conflito + check cota + check horas pré-manutenção | 3 validações antes de confirmar |
| 2.4 | Lista de espera + notificação quando slot libera | Realtime Supabase |
| 2.5 | Painel manutenção: maintenance_items + progresso + próxima data | Cards 50h/100h/TBO/seguro/docs |
| 2.6 | Trigger alertas manutenção → notifications para membros | Alertas auto |
| 2.7 | Registro manutenção realizada → recalcula next_due | Ciclo completo |
| 2.8 | Dashboard atualizado: horas + manutenção + agenda realtime | Painel operacional |

### Sprint 3 — M4 + Financeiro + Escala (Semanas 9-12)

| # | Tarefa | Resultado |
|---|--------|-----------|
| 3.1 | Central notificações: bell icon + lista + marcar lido | Feed operacional |
| 3.2 | Canais comunicação por aeronave (manutenção/agenda/financeiro) | M4 básico |
| 3.3 | Custo/hora + cálculo auto por voo | Transparência financeira |
| 3.4 | Rateio manutenção proporcional à cota + extrato | Prestação de contas |
| 3.5 | Múltiplas aeronaves por conta (escolas RBAC 141) | Plano Escola |
| 3.6 | API REST documentada | Plano Operador/Enterprise |

---

## 5. Melhorias sugeridas

### Produto — adicionar

| Melhoria | Problema | Quando |
|----------|----------|--------|
| QR Code por aeronave | Identifica sem digitar matrícula | Sprint 1 |
| Onboarding wizard | Sem onboarding = abandono | Sprint 1 |
| Importação histórico (planilhas) | Resistência à adoção sem migração | Sprint 2 |
| Checklist pré-voo digital | Valorizado por pilotos, diferencia de concorrente | Sprint 2 |
| Relatório mensal auto por proprietário | Email com horas/custo/manutenção. Reduz churn | Sprint 3 |
| Marketplace de horas | Investidor subloca horas. Receita: comissão | Fase 3 |

### Decisões técnicas antes de codar

**Imutabilidade eDB:**
- MVP: `locked` boolean + RLS bloqueia UPDATE após assinatura. Errata via INSERT novo.
- Produção: blockchain ou carimbo ICP-Brasil.

**Mobile:**
- MVP: PWA (Next.js + SW) resolve offline.
- Fase 3: React Native se precisar câmera nativa ou Bluetooth aviônicos.

**Preços MVP:**
- Focar apenas Individual (R$299) e Compartilhado (R$599) nos primeiros 50 clientes.

### Negócio — gaps a resolver

- Ateste software ANAC: quem lidera? Consultor regulatório no time?
- LGPD/DPA: CANAC e logs de voo são dados sensíveis
- SLA: qual uptime para plano Operador?
- Beta: quem são os 5-10 operadores da Fase 0?
- Go-to-market: AOPA Brasil, ANPAVIA, escolas, grupos WhatsApp/Telegram de multiproprietários

---

## 6. Mapa de rotas

### Públicas

| Rota | Página |
|------|--------|
| /login | Login email/senha → redirect /dashboard se auth |
| /register | Cadastro + trigger cria profile |
| /forgot-password | Magic link Supabase |

### Protegidas

| Rota | Módulo | Pré-requisito |
|------|--------|---------------|
| /dashboard | — | Auth + aircraft_members. Sprint 0 |
| /dashboard/profile | — | Sprint 0 |
| /aircraft/new | — | Sprint 1.1. Qualquer auth |
| /aircraft/[id] | M1+M3 | Sprint 1.2. Membro |
| /aircraft/[id]/logbook | M1 | Sprint 1.7. Membro |
| /aircraft/[id]/logbook/new | M1 | Sprint 1.3. Role: pilot+ |
| /aircraft/[id]/logbook/[flightId] | M1 | Sprint 1.6. Membro |
| /aircraft/[id]/schedule | M2 | Sprint 2.2. Members populado |
| /aircraft/[id]/maintenance | M3 | Sprint 2.5. Items criados |
| /aircraft/[id]/members | M2 | Sprint 2.1. Role: manager |
| /aircraft/[id]/settings | — | Sprint 2. Role: manager |
| /admin/* | — | Role: super_admin |

### Middleware (middleware.ts)

```
matcher: ['/((?!_next|api|login|register|forgot-password).*)']
1. Sem session → /login
2. Session + perfil incompleto → /dashboard/profile?setup=true
3. /admin/* + role !== super_admin → 403
4. /aircraft/[id]/* + não membro → 403
5. Demais → prosseguir
```

---

## 7. Checklist por sprint

### Sprint 0 ✓ quando:
- [ ] Registro + login funcionando
- [ ] Profile criado via trigger
- [ ] Dashboard redireciona se não auth
- [ ] Todas tabelas + migrations
- [ ] RLS testado (A não vê B)
- [ ] Deploy Vercel ok

### Sprint 1 ✓ quando:
- [ ] Cadastro aeronave (avião + helicóptero)
- [ ] Form voo com todos campos ANAC
- [ ] Trigger atualiza horas auto
- [ ] PDF exportado com hash
- [ ] Offline + sync funcional
- [ ] Lista voos paginada + filtros

### Sprint 2 ✓ quando:
- [ ] Membros com papéis e cotas
- [ ] Calendário com disponibilidade correta
- [ ] Reserva detecta/bloqueia conflitos
- [ ] Bloqueio por horas pré-manutenção
- [ ] Alertas manutenção via trigger
- [ ] Registro manutenção recalcula corretamente

### Sprint 3 ✓ quando:
- [ ] Notificações realtime no bell
- [ ] Custo/hora por voo
- [ ] Extrato rateio entre proprietários
- [ ] Múltiplas aeronaves (plano Escola)
- [ ] API documentada + 1 endpoint testado

---

> **Para Antigravity:** respeitar ordem dos sprints e tarefas. Maior risco = construir M2/M3 antes de M1 sólido, ou rotas sem RLS. Sprint 0 impecável. Todo o resto é consequência.
