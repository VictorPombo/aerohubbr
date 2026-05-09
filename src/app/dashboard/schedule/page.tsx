'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Schedule Page (Placeholder)
// ═══════════════════════════════════════════════════════

import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SchedulePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6 text-aero-cyan" />
          Agendamentos
        </h2>
        <p className="text-sm text-muted-foreground">
          Módulo de agendamentos e escala de aeronaves em desenvolvimento.
        </p>
      </div>
      <Card className="glass border-border/50">
        <CardContent className="p-12 text-center text-muted-foreground">
          <p>Em breve: Calendário multiproprietário, reserva de horas, aprovação de voos e gestão de conflitos.</p>
        </CardContent>
      </Card>
    </div>
  );
}
