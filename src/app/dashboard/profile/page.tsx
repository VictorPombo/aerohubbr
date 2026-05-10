'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Key, 
  Bell, 
  ShieldCheck, 
  PlaneTakeoff,
  LogOut,
  Save,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    canac: user?.canac || '',
  });
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const roleMap: Record<string, string> = {
    'pilot': 'Piloto',
    'owner_active': 'Proprietário (Ativo)',
    'owner_investor': 'Proprietário (Investidor)',
    'manager': 'Gestor de Frota',
    'super_admin': 'Super Admin'
  };

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // In a real app, we would update the backend here.
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      
      {/* Header Section */}
      <div className="relative rounded-3xl overflow-hidden glass-strong border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-aero-cyan/20 to-aero-navy/20" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
        />
        
        <div className="relative p-8 flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background/80 bg-background/50 overflow-hidden flex items-center justify-center backdrop-blur-xl shadow-2xl">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-aero-cyan text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">{formData.name}</h1>
              <Badge className="bg-aero-cyan/10 text-aero-cyan border-aero-cyan/20 mx-auto md:mx-0 w-fit">
                {roleMap[user.role] || user.role}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {formData.email}
            </p>
          </div>

          {/* Action */}
          <div className="shrink-0 flex gap-3">
            <Button variant="outline" className="border-aero-rose/20 text-aero-rose hover:bg-aero-rose/10 hover:text-aero-rose" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Settings Nav */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Configurações</h3>
          
          <nav className="space-y-1">
            <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] border border-border/50 text-foreground font-medium transition-colors">
              <User className="w-5 h-5 text-aero-cyan" /> Dados Pessoais
            </Link>
            
            <Link href="/dashboard/pilot-profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] text-muted-foreground hover:text-foreground transition-colors group">
              <PlaneTakeoff className="w-5 h-5 group-hover:text-aero-cyan transition-colors" /> Perfil de Piloto
            </Link>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] text-muted-foreground hover:text-foreground transition-colors group">
              <Key className="w-5 h-5 group-hover:text-aero-cyan transition-colors" /> Segurança & Senha
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] text-muted-foreground hover:text-foreground transition-colors group">
              <Bell className="w-5 h-5 group-hover:text-aero-cyan transition-colors" /> Notificações
            </button>
            
            <Link href="/dashboard/profile/privacy" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] text-muted-foreground hover:text-foreground transition-colors group">
              <ShieldCheck className="w-5 h-5 group-hover:text-aero-cyan transition-colors" /> Privacidade & LGPD
            </Link>
          </nav>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Atualize seus dados de contato e identificação.</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Editar Dados
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                      className="bg-background/50 border-border/50 focus:border-aero-cyan"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                      className="bg-background/50 border-border/50 focus:border-aero-cyan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canac">Código ANAC (CANAC)</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="canac" 
                        value={formData.canac} 
                        onChange={e => setFormData({...formData, canac: e.target.value})}
                        disabled={!isEditing}
                        className="pl-10 bg-background/50 border-border/50 focus:border-aero-cyan mono-data"
                        placeholder="Ex: 123456"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Utilizado para validação em Diários de Bordo.</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-aero-cyan hover:bg-aero-cyan-light text-black">
                      <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                    </Button>
                  </div>
                )}

                {saved && (
                  <div className="p-3 bg-aero-emerald/10 border border-aero-emerald/20 text-aero-emerald rounded-lg flex items-center justify-center gap-2 animate-fade-in text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Perfil atualizado com sucesso!
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-aero-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <CardTitle className="text-lg">Assinatura Digital (eDB)</CardTitle>
              <CardDescription>Sua assinatura utilizada no Diário de Bordo Digital da ANAC.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-background/50 border border-border/50 rounded-xl">
                <div>
                  <p className="font-medium text-foreground">Status da Assinatura</p>
                  <p className="text-sm text-muted-foreground">Senha + SHA-256 (Padrão AeroGest)</p>
                </div>
                <Badge className="bg-aero-emerald/10 text-aero-emerald border-aero-emerald/20">Configurada</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                No momento, o sistema utiliza a sua senha de acesso combinada com criptografia forte para selar os voos. Na Fase 3, disponibilizaremos a integração com certificados ICP-Brasil (e-CPF).
              </p>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
