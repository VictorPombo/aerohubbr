'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Aircraft Overview (Real Data)
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Plane, Calendar, Gauge, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AircraftOverviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [aircraft, setAircraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAircraft() {
      try {
        const { data, error } = await supabase
          .from('aircraft')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          throw new Error('Aeronave não encontrada');
        }

        setAircraft(data);
      } catch (err) {
        console.error(err);
        toast.error('Aeronave não encontrada.');
        router.push('/dashboard/aircraft');
      } finally {
        setIsLoading(false);
      }
    }

    loadAircraft();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <Card className="glass border-border/50 h-64 bg-white/5" />
        <Card className="glass border-border/50 h-64 md:col-span-2 bg-white/5" />
      </div>
    );
  }

  if (!aircraft) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {/* Info Column */}
      <div className="space-y-6">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Matrícula</span>
                <p className="text-sm text-foreground font-mono font-bold mt-0.5">
                  {aircraft.registration}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Tipo ICAO</span>
                <p className="text-sm text-foreground capitalize flex items-center gap-1.5 mt-0.5">
                  <Plane className="w-3.5 h-3.5 text-aero-cyan" /> {aircraft.type_code || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Fabricante</span>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {aircraft.manufacturer || 'Não informado'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Modelo</span>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {aircraft.model}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Aeroporto Base</span>
                <p className="text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-aero-cyan" /> {aircraft.base_airport || 'Não informado'}
                </p>
              </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Horas de Célula</span>
                <p className="mono-data text-2xl font-bold text-foreground mt-1">
                  {Number(aircraft.total_airframe_hours || 0).toFixed(1)}h
                </p>
              </div>
              <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4 opacity-50">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Horas de Motor</span>
                <p className="mono-data text-2xl font-bold text-foreground mt-1">
                  {Number(aircraft.total_engine_hours || 0).toFixed(1)}h
                </p>
                <span className="text-[10px] text-aero-cyan">Em breve</span>
              </div>
              <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4 opacity-50">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Pousos (Ciclos)</span>
                <p className="mono-data text-2xl font-bold text-foreground mt-1">
                  {aircraft.total_cycles || 0}
                </p>
                <span className="text-[10px] text-aero-cyan">Em breve</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Placeholder for Maintenance Alerts - Future Sprint */}
        <Card className="glass border-border/50 opacity-60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
               Resumo de Alertas de Manutenção
            </CardTitle>
            <span className="text-xs bg-black/20 px-2 py-1 rounded">Sprints Futuros</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O rastreamento avançado de manutenções, boletins e revisões será conectado nos próximos Sprints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
