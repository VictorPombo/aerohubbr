'use client';

import { Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PilotProfilePlaceholder() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tripulação</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de pilotos, caderneta digital e vencimentos (CMA/CHT).
          </p>
        </div>
        <Badge variant="outline" className="text-aero-cyan border-aero-cyan/20 bg-aero-cyan/10">Sprint Futuro</Badge>
      </div>

      <Card className="glass border-border/50 flex flex-col min-h-[400px]">
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
            <Users className="w-10 h-10 text-aero-cyan/60" />
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">Módulo em Construção</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            A gestão completa da tripulação, incluindo controle de jornada, escalas e caderneta digital, será ativada nos próximos Sprints de desenvolvimento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-400/50" />
              <span className="text-sm font-medium text-slate-300">Controle de Escala</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3">
              <Users className="w-6 h-6 text-sky-400/50" />
              <span className="text-sm font-medium text-slate-300">Caderneta de Voo</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3">
              <span className="text-2xl">📜</span>
              <span className="text-sm font-medium text-slate-300">Validades CMA/CHT</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
