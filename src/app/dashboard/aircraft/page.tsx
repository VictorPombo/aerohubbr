'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Aircraft Fleet Page (Real Data)
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plane, Plus, Search, Filter, Calendar, Gauge, Trash2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { NewAircraftModal } from '@/components/new-aircraft-modal';

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-aero-emerald/10 text-aero-emerald border-aero-emerald/20' },
  maintenance: { label: 'Em Manutenção', className: 'bg-aero-amber/10 text-aero-amber border-aero-amber/20' },
  grounded: { label: 'Inoperante', className: 'bg-aero-rose/10 text-aero-rose border-aero-rose/20' },
};

export default function AircraftPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [aircraftList, setAircraftList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar dados reais do Supabase
  const loadAircraft = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('aircraft')
        .select(`
          *,
          aircraft_owners!inner(owner_id)
        `)
        .eq('aircraft_owners.owner_id', user.id);

      if (error) throw error;
      setAircraftList(data || []);
    } catch (error) {
      console.error('Erro ao buscar aeronaves detalhado:', JSON.stringify(error, null, 2), error);
      toast.error('Não foi possível carregar a frota.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAircraft();
  }, [user]);

  // Função para deletar (solicitada no Sprint 1)
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevenir navegação do Link
    e.stopPropagation();

    if (!confirm('Tem certeza que deseja excluir esta aeronave? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // 1. Deletar os owners (RLS exige cuidado, mas a FK com ON DELETE CASCADE faria isso)
      // Como não usamos cascade no schema para owners, deletamos manualmente primeiro
      await supabase.from('aircraft_owners').delete().eq('aircraft_id', id);
      
      // 2. Deletar a aeronave
      const { error } = await supabase.from('aircraft').delete().eq('id', id);
      
      if (error) throw error;
      
      toast.success('Aeronave excluída com sucesso.');
      loadAircraft(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar aeronave:', error);
      toast.error('Erro ao excluir aeronave.');
    }
  };

  const filteredAircraft = aircraftList.filter(
    (a) =>
      a.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Plane className="w-6 h-6 text-aero-cyan" />
            Aeronaves
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas aeronaves, horas de voo e manutenções.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-aero-cyan hover:bg-aero-cyan-light text-aero-navy font-semibold gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Aeronave
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por matrícula ou modelo..."
            className="pl-9 bg-white/[0.02] border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-border/50 bg-white/[0.02]">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Aircraft Grid ou Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {isLoading ? (
          // Skeletons para evitar a tela piscando
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass border-border/50 h-[220px] flex flex-col p-5">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="w-24 h-6 bg-white/5 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex gap-4">
                  <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                    <div className="w-12 h-4 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredAircraft.length > 0 ? (
          filteredAircraft.map((aircraft) => {
            const statusKey = aircraft.status as keyof typeof statusConfig;
            const status = statusConfig[statusKey] || statusConfig.active;
            
            return (
              <Link key={aircraft.id} href={`/dashboard/aircraft/${aircraft.id}`} className="flex flex-col h-full">
                <Card
                  className="glass border-border/50 glass-hover cursor-pointer group flex flex-col flex-1 relative"
                >
                  <CardContent className="p-5 flex-1 flex flex-col">
                    {/* Header: Registration + Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="registration-plate text-xl text-foreground group-hover:text-aero-cyan transition-colors">
                          {aircraft.registration}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {aircraft.manufacturer} {aircraft.model}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] font-semibold', status.className)}
                        >
                          {status.label}
                        </Badge>
                        <button
                          onClick={(e) => handleDelete(e, aircraft.id)}
                          className="p-1.5 text-muted-foreground hover:text-aero-rose hover:bg-aero-rose/10 rounded-md transition-colors z-10"
                          title="Excluir Aeronave"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Type + Base */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Plane className="w-3.5 h-3.5" />
                        <span>{aircraft.type_code || 'N/A'}</span>
                      </div>
                      {aircraft.base_airport && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{aircraft.base_airport}</span>
                        </div>
                      )}
                    </div>

                    {/* Hours Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5" />
                          Horas Célula
                        </span>
                        <span className="mono-data text-sm font-semibold text-foreground">
                          {(aircraft.total_airframe_hours || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1 })}h
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-aero-cyan to-aero-cyan-light rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(((aircraft.total_airframe_hours || 0) / 3000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-1" />

                    <div className="mt-auto pt-3 border-t border-border/50">
                      <Button className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-border/50 text-foreground transition-colors group-hover:border-aero-cyan/30 group-hover:text-aero-cyan pointer-events-none">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma aeronave encontrada na sua frota.</p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="outline" 
              className="border-aero-cyan/30 text-aero-cyan hover:bg-aero-cyan/10"
            >
              Cadastrar Primeira Aeronave
            </Button>
          </div>
        )}
      </div>

      {/* Modal Nova Aeronave */}
      {isModalOpen && (
        <NewAircraftModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadAircraft(); // Recarrega os dados após salvar
          }}
        />
      )}
    </div>
  );
}
