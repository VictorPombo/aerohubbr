'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockChecklistTemplates, mockAircraft } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ChecklistExecutePage() {
  const { id, type } = useParams();
  const router = useRouter();

  const aircraft = mockAircraft.find(a => a.id === id);
  const template = mockChecklistTemplates.find(t => t.type === type);

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);

  if (!aircraft || !template) return null;

  const totalItems = template.items.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = (checkedCount / totalItems) * 100;

  const allCriticalChecked = template.items
    .filter(i => i.is_critical)
    .every(i => checkedItems[i.order]);

  function toggleItem(order: number) {
    if (completed) return;
    setCheckedItems(prev => ({
      ...prev,
      [order]: !prev[order]
    }));
  }

  function handleComplete() {
    if (!allCriticalChecked) return;
    setCompleted(true);
    // In a real app, we would save the execution record here.
    setTimeout(() => {
      router.push(`/dashboard/aircraft/${id}/checklist`);
    }, 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/aircraft/${id}/checklist`} className="p-2 bg-white/[0.02] border border-border/50 rounded-lg hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{template.name}</h1>
          <p className="text-sm text-muted-foreground">{aircraft.registration} • {aircraft.model}</p>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-[#0A0F1E] py-4 border-b border-border/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progresso</span>
          <span className="text-sm font-mono text-aero-cyan">{checkedCount} / {totalItems}</span>
        </div>
        <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <div 
            className="h-full bg-aero-cyan transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {template.items.map(item => {
          const isChecked = checkedItems[item.order];
          return (
            <Card 
              key={item.order} 
              className={`glass-card overflow-hidden transition-all cursor-pointer ${isChecked ? 'border-aero-emerald/30 bg-aero-emerald/5' : 'hover:bg-white/[0.02]'}`}
              onClick={() => toggleItem(item.order)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] uppercase bg-black/20 text-muted-foreground border-border/50">
                      {item.category}
                    </Badge>
                    {item.is_critical && (
                      <Badge variant="outline" className="text-[10px] uppercase bg-aero-rose/10 text-aero-rose border-aero-rose/20">
                        Crítico
                      </Badge>
                    )}
                  </div>
                  <h3 className={`font-medium text-lg ${isChecked ? 'text-foreground/70' : 'text-foreground'}`}>
                    {item.item}
                  </h3>
                  <p className={`text-sm ${isChecked ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                    {item.action}
                  </p>
                </div>

                <div className={`w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                  isChecked 
                    ? 'bg-aero-emerald border-aero-emerald text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                    : 'border-border/50 text-transparent'
                }`}>
                  <Check className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 sm:left-64 flex justify-center">
        <div className="w-full max-w-3xl flex items-center gap-4">
          {!allCriticalChecked ? (
            <div className="flex-1 p-3 rounded-lg bg-aero-amber/10 border border-aero-amber/20 flex gap-3 text-sm text-aero-amber">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Conclua todos os itens críticos para finalizar o checklist.</p>
            </div>
          ) : completed ? (
            <div className="flex-1 p-3 rounded-lg bg-aero-emerald/10 border border-aero-emerald/20 flex items-center justify-center gap-3 text-sm font-medium text-aero-emerald animate-fade-in">
              <ShieldCheck className="w-5 h-5" /> Checklist concluído com sucesso. Salvando...
            </div>
          ) : (
            <Button onClick={handleComplete} className="w-full bg-aero-emerald text-black hover:bg-emerald-500 text-lg py-6 font-bold">
              <Check className="w-5 h-5 mr-2" /> Concluir Checklist
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
