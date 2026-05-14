'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Dashboard Home Page (Real Data)
// ═══════════════════════════════════════════════════════

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Clock, AlertTriangle, Calendar, Plus, MapPin, Wrench } from 'lucide-react';
import { NewAircraftModal } from '@/components/new-aircraft-modal';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Piloto';

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [metrics, setMetrics] = useState({
    aircraftCount: 0,
    totalHours: 0,
  });

  const [recentAircraft, setRecentAircraft] = useState<any[]>([]);

  // Carregar dados reais do Supabase
  const loadDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Buscar aeronaves
      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircraft')
        .select(`
          *,
          aircraft_owners!inner(owner_id)
        `)
        .eq('aircraft_owners.owner_id', user.id);

      if (aircraftError) throw aircraftError;

      const aircrafts = aircraftData || [];
      
      // 2. Calcular KPIs
      const aircraftCount = aircrafts.length;
      const totalHours = aircrafts.reduce((acc, a) => acc + (Number(a.total_airframe_hours) || 0), 0);

      setMetrics({ aircraftCount, totalHours });
      setRecentAircraft(aircrafts.slice(0, 4)); // Pegar as 4 primeiras para a lista rápida
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', JSON.stringify(error, null, 2), error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Bem-vindo, <span className="text-aero-cyan">{firstName}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aqui está o resumo da sua frota hoje.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-aero-cyan hover:bg-aero-cyan-light text-aero-navy font-semibold gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Aeronave
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {/* KPI 1: Total Frota */}
        <Link href="/dashboard/aircraft" className="flex flex-col h-full">
          <Card className="glass border-border/50 glass-hover h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.02]">
            <CardContent className="p-5 flex-1 flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aeronaves na Frota</p>
                  <div className="flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="w-16 h-8 bg-white/5 rounded animate-pulse" />
                    ) : (
                      <span className="text-2xl font-bold text-foreground mono-data">{metrics.aircraftCount}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl border text-aero-cyan bg-aero-cyan/10 border-aero-cyan/20">
                  <Plane className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* KPI 2: Horas Voadas */}
        <Card className="glass border-border/50 h-full flex flex-col cursor-default">
          <CardContent className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total de Horas</p>
                <div className="flex items-baseline gap-2">
                  {isLoading ? (
                    <div className="w-20 h-8 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className="text-2xl font-bold text-foreground mono-data">{metrics.totalHours.toFixed(1)}h</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border text-aero-emerald bg-aero-emerald/10 border-aero-emerald/20">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Próximos Voos (Placeholder Sprint 3) */}
        <Card className="glass border-border/50 h-full flex flex-col cursor-default opacity-50">
          <CardContent className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agendamentos</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground mono-data">0</span>
                </div>
                <span className="text-xs text-aero-cyan">Sprint 3</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border text-aero-amber bg-aero-amber/10 border-aero-amber/20">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Manutenção (Placeholder Futuro) */}
        <Card className="glass border-border/50 h-full flex flex-col cursor-default opacity-50">
          <CardContent className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alertas (CTM)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground mono-data">0</span>
                </div>
                <span className="text-xs text-aero-cyan">Futuro</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border text-aero-rose bg-aero-rose/10 border-aero-rose/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Frota Rápida */}
        <Card className="glass border-border/50 flex flex-col min-h-[300px]">
          <CardHeader className="pb-3 border-b border-border/10">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-aero-cyan" />
                Suas Aeronaves
              </div>
              <Link href="/dashboard/aircraft" className="text-xs font-normal text-aero-cyan hover:underline">
                Ver todas
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {isLoading ? (
              <div className="p-5 space-y-4">
                <div className="w-full h-12 bg-white/5 rounded animate-pulse" />
                <div className="w-full h-12 bg-white/5 rounded animate-pulse" />
              </div>
            ) : recentAircraft.length > 0 ? (
              <div className="divide-y divide-border/10">
                {recentAircraft.map((aircraft) => (
                  <Link 
                    key={aircraft.id} 
                    href={`/dashboard/aircraft/${aircraft.id}`}
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div>
                      <p className="font-mono font-bold text-foreground">{aircraft.registration}</p>
                      <p className="text-xs text-muted-foreground">{aircraft.manufacturer} {aircraft.model}</p>
                    </div>
                    <div className="text-right">
                      <p className="mono-data font-semibold">{Number(aircraft.total_airframe_hours || 0).toFixed(1)}h</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{aircraft.base_airport || 'S/ BASE'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-70">
                <Plane className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Nenhuma aeronave</p>
                <p className="text-xs text-muted-foreground mt-1">Cadastre sua primeira aeronave para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Voos Recentes (Sprint 2 Preview) */}
        <Card className="glass border-border/50 flex flex-col min-h-[300px] opacity-70">
          <CardHeader className="pb-3 border-b border-border/10">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aero-emerald" />
                Voos Recentes
              </div>
              <Badge variant="outline" className="text-[10px]">Sprint 2</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Diário de Bordo Vazio</p>
            <p className="text-xs text-muted-foreground mt-1">
              O módulo de registro de voos será ativado no Sprint 2.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal Nova Aeronave */}
      {isModalOpen && (
        <NewAircraftModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadDashboardData(); // Recarrega KPIs após salvar
          }}
        />
      )}
    </div>
  );
}
