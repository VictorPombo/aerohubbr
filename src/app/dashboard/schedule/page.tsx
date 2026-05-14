'use client';

import { LucideIcon, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlaceholderPage() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Módulo em Construção</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Esta funcionalidade está no roadmap para os próximos Sprints.
          </p>
        </div>
        <Badge variant="outline" className="text-aero-cyan border-aero-cyan/20 bg-aero-cyan/10">Sprint Futuro</Badge>
      </div>

      <Card className="glass border-border/50 flex flex-col min-h-[400px]">
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
            <Rocket className="w-10 h-10 text-aero-cyan/60" />
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">Em Breve</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            A equipe de desenvolvimento está focada nos módulos principais agora. Esta seção será liberada nas próximas atualizações do AeroHub.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

