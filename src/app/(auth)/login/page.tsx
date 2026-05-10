'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Login Page (Simulated Auth)
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plane, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Se já estiver logado, manda pro dashboard direto
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
    router.push('/dashboard');
  }

  // Se estiver carregando a sessão, mostra um loader para evitar piscar a tela de login
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-aero-cyan/30 border-t-aero-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full animate-gradient opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full animate-gradient opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aero-cyan/10 border border-aero-cyan/20 mb-4 glow-cyan">
            <Plane className="w-8 h-8 text-aero-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Aero<span className="text-aero-cyan text-glow-cyan">Gest</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gestão inteligente para aviação geral
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-strong border-border/50 shadow-2xl">
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-center text-foreground">
              Acesse sua conta
            </h2>
            <p className="text-xs text-center text-muted-foreground">
              MVP Local — qualquer credencial é aceita
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="piloto@aerogest.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-border/50 focus:border-aero-cyan/50 focus:ring-aero-cyan/20 placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10 bg-background/50 border-border/50 focus:border-aero-cyan/50 focus:ring-aero-cyan/20 placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="lgpd"
                  required
                  className="mt-1 h-4 w-4 rounded border-border/50 bg-background/50 text-aero-cyan focus:ring-aero-cyan/20"
                />
                <Label htmlFor="lgpd" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                  Concordo com os <button type="button" className="text-aero-cyan hover:underline">Termos de Uso</button> e a <button type="button" className="text-aero-cyan hover:underline">Política de Privacidade</button>, e consinto com o processamento dos meus dados conforme a LGPD.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-aero-cyan hover:bg-aero-cyan-light text-aero-navy font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-aero-cyan/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Footer links */}
            <div className="mt-6 text-center space-y-2">
              <button className="text-xs text-muted-foreground hover:text-aero-cyan transition-colors">
                Esqueceu sua senha?
              </button>
              <div className="text-xs text-muted-foreground">
                Não tem conta?{' '}
                <button className="text-aero-cyan hover:text-aero-cyan-light transition-colors font-medium">
                  Cadastre-se
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version tag */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6 mono-data">
          AeroGest v1.0.0-mvp
        </p>
      </div>
    </div>
  );
}
