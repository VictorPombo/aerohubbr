'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Maintenance Details Sheet
// ═══════════════════════════════════════════════════════

import { MaintenanceAlert, Aircraft } from '@/types/models';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plane, Wrench, AlertTriangle, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface MaintenanceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: MaintenanceAlert | null;
  aircraft: Aircraft | null;
}

const statusConfig = {
  ok: { label: 'Em Dia', color: 'text-aero-emerald', border: 'border-aero-emerald/20', bg: 'bg-aero-emerald/10' },
  approaching: { label: 'Próximo ao Vencimento', color: 'text-aero-amber', border: 'border-aero-amber/20', bg: 'bg-aero-amber/10' },
  due: { label: 'Vencido', color: 'text-aero-rose', border: 'border-aero-rose/20', bg: 'bg-aero-rose/10' },
  overdue: { label: 'Atrasado', color: 'text-aero-rose', border: 'border-aero-rose/20', bg: 'bg-aero-rose/10' },
};

export function MaintenanceDetailsSheet({ open, onOpenChange, alert, aircraft }: MaintenanceDetailsSheetProps) {
  if (!alert) return null;

  const cfg = statusConfig[alert.status];
  const remaining = alert.next_due_hours - alert.current_hours;
  const progress = Math.min(100, Math.max(0, (alert.current_hours / alert.next_due_hours) * 100)) || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-xl glass-strong border-l border-border/50 p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2 text-foreground">
                <Wrench className="w-5 h-5 text-aero-cyan" />
                Controle Técnico
              </SheetTitle>
              <SheetDescription className="text-sm mt-1">
                Acompanhamento de revisões e componentes
              </SheetDescription>
            </div>
            <Badge variant="outline" className={cn('px-3 py-1 text-xs font-bold', cfg.bg, cfg.color, cfg.border)}>
              {cfg.label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-8 animate-fade-in">
          {/* Header Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Aeronave</span>
              <p className="registration-plate text-lg text-foreground">{aircraft?.registration || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{aircraft?.model}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Componente / Tarefa</span>
              <p className="text-lg font-medium text-foreground">{alert.component}</p>
              <p className="text-xs text-muted-foreground">Tipo: Revisão de {alert.type}</p>
            </div>
          </div>

          {/* Alert Status Box */}
          <div className={cn("rounded-xl p-5 border flex gap-4", cfg.bg, cfg.border)}>
            {alert.status === 'ok' ? (
              <CheckCircle2 className={cn("w-6 h-6 shrink-0 mt-0.5", cfg.color)} />
            ) : (
              <AlertTriangle className={cn("w-6 h-6 shrink-0 mt-0.5", cfg.color)} />
            )}
            <div className="space-y-2 flex-1">
              <p className={cn("text-base font-semibold", cfg.color)}>
                {alert.status === 'due' || alert.status === 'overdue' 
                  ? 'Atenção Imediata Necessária' 
                  : alert.status === 'approaching' 
                    ? 'Agendamento Recomendado' 
                    : 'Componente Operacional'}
              </p>
              <p className="text-sm text-foreground/80">
                {alert.type === 'document' 
                  ? 'Documento com vencimento calendarístico.'
                  : `Faltam ${remaining.toFixed(1)}h para o vencimento do limite técnico de ${alert.next_due_hours}h.`
                }
              </p>
              
              {/* Progress Bar (if based on hours) */}
              {alert.type !== 'document' && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-muted-foreground">Consumo: {progress.toFixed(1)}%</span>
                    <span className={cfg.color}>{remaining.toFixed(1)}h restantes</span>
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000 rounded-full", 
                        alert.status === 'ok' ? 'bg-aero-emerald' : 
                        alert.status === 'approaching' ? 'bg-aero-amber' : 'bg-aero-rose'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-aero-cyan" />
              Detalhes Técnicos
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-border/30">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Limite / Limite TBO</span>
                <p className="mono-data text-sm text-foreground">{alert.next_due_hours > 0 ? `${alert.next_due_hours.toFixed(1)}h` : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Horas Atuais Aplicadas</span>
                <p className="mono-data text-sm text-foreground">{alert.current_hours > 0 ? `${alert.current_hours.toFixed(1)}h` : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Aviso Configurado Para</span>
                <p className="text-sm text-foreground">{alert.alert_at_hours}h antes do vencimento</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Intervalo da Tarefa</span>
                <p className="text-sm text-foreground">{alert.threshold_hours > 0 ? `A cada ${alert.threshold_hours}h` : 'Único/Calendário'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-aero-cyan" />
              Observações do Mecânico / Operador
            </h4>
            <div className="bg-white/[0.02] border border-border/30 rounded-xl p-4">
              {alert.notes ? (
                <p className="text-sm text-foreground/80 leading-relaxed">{alert.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhuma observação adicional registrada para este item.</p>
              )}
            </div>
          </div>
          
          <div className="pb-8" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
