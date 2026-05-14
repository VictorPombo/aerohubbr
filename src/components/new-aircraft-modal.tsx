import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NewAircraftModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewAircraftModal({ onClose, onSuccess }: NewAircraftModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    registration: '',
    manufacturer: '',
    model: '',
    type_code: '',
    base_airport: '',
    total_airframe_hours: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Get the user's company_id from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      let companyId = profile?.company_id;

      // If user doesn't have a company, we might need to create a default one or throw an error.
      // For MVP, if no company exists, let's create a placeholder "Personal Fleet" for them.
      if (!companyId) {
        const { data: newCompany, error: newCompanyError } = await supabase
          .from('companies')
          .insert({ name: `Frota de ${user.full_name || 'Usuário'}` })
          .select()
          .single();
        
        if (newCompanyError) throw newCompanyError;
        companyId = newCompany.id;

        // Update user's profile with this new company
        await supabase.from('profiles').update({ company_id: companyId }).eq('id', user.id);
      }

      // 2. Insert aircraft
      const { data: aircraft, error: aircraftError } = await supabase
        .from('aircraft')
        .insert({
          company_id: companyId,
          registration: formData.registration,
          manufacturer: formData.manufacturer,
          model: formData.model,
          type_code: formData.type_code,
          base_airport: formData.base_airport,
          total_airframe_hours: parseFloat(formData.total_airframe_hours) || 0,
          status: 'active',
        })
        .select()
        .single();

      if (aircraftError) throw aircraftError;

      // 3. Link user as owner
      const { error: ownerError } = await supabase
        .from('aircraft_owners')
        .insert({
          aircraft_id: aircraft.id,
          owner_id: user.id,
          ownership_percentage: 100, // 100% since they created it
        });

      if (ownerError) throw ownerError;

      toast.success('Aeronave cadastrada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar aeronave:', JSON.stringify(error, null, 2), error);
      toast.error('Ocorreu um erro ao cadastrar a aeronave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/[0.02]">
          <h3 className="font-semibold text-lg">Nova Aeronave</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="registration">Matrícula</Label>
              <Input
                id="registration"
                placeholder="PT-XXX"
                value={formData.registration}
                onChange={handleChange}
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="type_code">Código ICAO</Label>
              <Input
                id="type_code"
                placeholder="C182"
                value={formData.type_code}
                onChange={handleChange}
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                placeholder="Cessna"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                placeholder="182 Skylane"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="base_airport">Aeroporto Base</Label>
              <Input
                id="base_airport"
                placeholder="SBSP"
                value={formData.base_airport}
                onChange={handleChange}
                className="uppercase"
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="total_airframe_hours">Horas Totais</Label>
              <Input
                id="total_airframe_hours"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.total_airframe_hours}
                onChange={(e) => setFormData({ ...formData, total_airframe_hours: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-aero-cyan hover:bg-aero-cyan-light text-aero-navy font-semibold min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
