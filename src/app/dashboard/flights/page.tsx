'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Flights Page (Diário de Bordo)
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { mockFlightLogs, mockAircraft } from '@/lib/mock-data';
import { FlightLog } from '@/types/models';
import { BookOpen, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlightDetailsSheet } from '@/components/flight-details-sheet';
import Link from 'next/link';

export default function FlightsPage() {
  const [selectedFlight, setSelectedFlight] = useState<FlightLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAircraft = selectedFlight ? mockAircraft.find(a => a.id === selectedFlight.aircraft_id) || null : null;

  const filteredLogs = mockFlightLogs.filter(f => 
    f.origin_icao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.destination_icao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.pilot_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.date.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-aero-cyan" />
          Diário de Bordo
        </h2>
        <p className="text-sm text-muted-foreground">
          Registro de voos, horas de tripulantes e ocorrências (Parte I e II).
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por ICAO, Piloto ou Data..." 
            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-aero-cyan w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="border-border/50 bg-background/50 gap-2 flex-1 sm:flex-none">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Link href="/dashboard/flights/new">
            <Button className="bg-aero-cyan hover:bg-aero-cyan-light text-aero-navy font-semibold gap-2 flex-1 sm:flex-none w-full">
              <Plus className="w-4 h-4" /> Registrar Voo
            </Button>
          </Link>
        </div>
      </div>

      {/* Table (Desktop) & Cards (Mobile) */}
      <Card className="glass border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/[0.02] border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold">Aeronave</th>
                  <th className="px-6 py-4 font-semibold">Trecho</th>
                  <th className="px-6 py-4 font-semibold text-center">Partida/Corte</th>
                  <th className="px-6 py-4 font-semibold text-center">Tempo Total</th>
                  <th className="px-6 py-4 font-semibold">Tripulação (PIC)</th>
                  <th className="px-6 py-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(flight => {
                    const aircraft = mockAircraft.find(a => a.id === flight.aircraft_id);
                    return (
                      <tr key={flight.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedFlight(flight)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-foreground">{flight.date.split('-').reverse().join('/')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="registration-plate font-semibold text-aero-cyan group-hover:text-aero-cyan-light transition-colors">{aircraft?.registration}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="mono-data font-bold text-foreground">{flight.origin_icao}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="mono-data font-bold text-foreground">{flight.destination_icao}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="mono-data text-muted-foreground">{flight.engine_start} - {flight.engine_stop}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant="outline" className="bg-white/[0.05] border-border/50 mono-data font-bold">
                            {flight.hours_flown.toFixed(1)}h
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-foreground">{flight.pilot_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground hover:text-aero-cyan">
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <FlightDetailsSheet 
        open={!!selectedFlight} 
        onOpenChange={(open) => !open && setSelectedFlight(null)} 
        flight={selectedFlight} 
        aircraft={selectedAircraft} 
      />
    </div>
  );
}
