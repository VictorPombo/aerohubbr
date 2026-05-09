'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Aircraft Details Page
// ═══════════════════════════════════════════════════════

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { mockAircraft, mockAircraftHours, mockFlightLogs, mockMaintenanceAlerts } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Plane, Calendar, Gauge, Wrench, ArrowLeft, MoreVertical, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-aero-emerald/10 text-aero-emerald border-aero-emerald/20' },
  maintenance: { label: 'Em Manutenção', className: 'bg-aero-amber/10 text-aero-amber border-aero-amber/20' },
  grounded: { label: 'Inoperante', className: 'bg-aero-rose/10 text-aero-rose border-aero-rose/20' },
};

const maintenanceStatusConfig = {
  ok: { label: 'OK', className: 'text-aero-emerald' },
  approaching: { label: 'Próximo', className: 'text-aero-amber' },
  due: { label: 'Vencido', className: 'text-aero-rose' },
  overdue: { label: 'Atrasado', className: 'text-aero-rose' },
};

export default function AircraftDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'maintenance'>('overview');

  const aircraft = mockAircraft.find(a => a.id === id);
  const hours = mockAircraftHours[id as string];
  const flights = mockFlightLogs.filter(f => f.aircraft_id === id);
  const alerts = mockMaintenanceAlerts.filter(a => a.aircraft_id === id);

  if (!aircraft) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Aeronave não encontrada</h2>
        <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  const status = statusConfig[aircraft.status];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground -ml-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50 bg-white/[0.02]">Editar</Button>
          <Button variant="outline" size="icon" className="border-border/50 bg-white/[0.02]">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Aircraft Profile Hero */}
      <div className="glass-strong border border-border/50 rounded-2xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-br from-aero-navy-light to-background border-b border-border/50 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
            <Plane className="w-64 h-64 text-foreground" />
          </div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
            <div className="flex gap-6 items-end">
              <div className="w-24 h-24 rounded-xl glass border-2 border-border/50 flex items-center justify-center shadow-2xl relative z-10">
                <Plane className="w-12 h-12 text-aero-cyan/40" />
              </div>
              <div className="pb-1">
                <h1 className="registration-plate text-3xl font-bold text-foreground glow-cyan">{aircraft.registration}</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1">{aircraft.model}</p>
              </div>
            </div>
            <div className="pb-2">
              <Badge variant="outline" className={cn('px-4 py-1.5 text-xs font-bold shadow-lg', status.className)}>
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-px overflow-x-auto">
        {(['overview', 'flights', 'maintenance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold transition-all border-b-2 relative whitespace-nowrap",
              activeTab === tab 
                ? "border-aero-cyan text-aero-cyan" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
            )}
          >
            {tab === 'overview' && 'Visão Geral'}
            {tab === 'flights' && 'Diário de Bordo'}
            {tab === 'maintenance' && 'Manutenção'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-aero-cyan glow-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Info Column */}
          <div className="space-y-6">
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Tipo</span>
                  <p className="text-sm text-foreground capitalize flex items-center gap-2 mt-0.5">
                    <Plane className="w-3.5 h-3.5 text-aero-cyan" /> {aircraft.type === 'airplane' ? 'Avião' : 'Helicóptero'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Ano de Fabricação</span>
                  <p className="text-sm text-foreground flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-aero-cyan" /> {aircraft.year}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hours Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-aero-cyan" /> Totalização de Horas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hours ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Horas de Célula</span>
                      <p className="mono-data text-2xl font-bold text-foreground mt-1">{hours.airframe_hours.toFixed(1)}h</p>
                    </div>
                    <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Horas de Motor</span>
                      <p className="mono-data text-2xl font-bold text-foreground mt-1">{hours.engine_hours.toFixed(1)}h</p>
                    </div>
                    <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Horas de Hélice/Rotor</span>
                      <p className="mono-data text-2xl font-bold text-foreground mt-1">{hours.prop_hours.toFixed(1)}h</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Dados de horímetro não encontrados.</p>
                )}
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-aero-amber" /> Resumo de Alertas
                </CardTitle>
                <Badge variant="outline" className="bg-aero-amber/10 text-aero-amber border-aero-amber/20">{alerts.filter(a => a.status !== 'ok').length} Pendentes</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.slice(0, 3).map(alert => {
                  const cfg = maintenanceStatusConfig[alert.status];
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-border/30">
                      <div className="flex items-center gap-3">
                        <Wrench className={cn("w-4 h-4", cfg.className)} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.component}</p>
                          <p className="text-xs text-muted-foreground">Revisão {alert.type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-bold", cfg.className)}>{cfg.label}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content: Flights */}
      {activeTab === 'flights' && (
        <Card className="glass border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Diário de Bordo ({aircraft.registration})</CardTitle>
          </CardHeader>
          <CardContent>
            {flights.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum voo registrado para esta aeronave.</p>
            ) : (
              <div className="space-y-2">
                {flights.map(flight => (
                  <div key={flight.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-border/30 hover:bg-white/[0.05] transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-aero-cyan/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-aero-cyan uppercase">{flight.date.split('-')[1]}</span>
                      <span className="text-lg font-bold text-aero-cyan leading-none">{flight.date.split('-')[2]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{flight.origin_icao} → {flight.destination_icao}</p>
                      <p className="text-xs text-muted-foreground">PIC: {flight.pilot_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="mono-data text-sm font-bold text-foreground">{flight.hours_flown.toFixed(1)}h</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{flight.engine_start} - {flight.engine_stop}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content: Maintenance */}
      {activeTab === 'maintenance' && (
        <Card className="glass border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Status de Manutenção ({aircraft.registration})</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum controle técnico cadastrado para esta aeronave.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => {
                  const cfg = maintenanceStatusConfig[alert.status];
                  return (
                    <div key={alert.id} className="p-4 rounded-xl bg-white/[0.02] border border-border/30 hover:border-border/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{alert.component}</p>
                          <p className="text-xs text-muted-foreground">Revisão {alert.type}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-xs font-bold", cfg.className)}>{cfg.label}</Badge>
                      </div>
                      <div className="flex justify-between text-xs mb-1 font-medium mt-4">
                        <span className="text-muted-foreground">Consumo Atual: {alert.current_hours}h</span>
                        <span className={cfg.className}>Limite: {alert.next_due_hours}h</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", alert.status === 'ok' ? 'bg-aero-emerald' : alert.status === 'approaching' ? 'bg-aero-amber' : 'bg-aero-rose')}
                          style={{ width: `${Math.min(100, Math.max(0, (alert.current_hours / alert.next_due_hours) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
