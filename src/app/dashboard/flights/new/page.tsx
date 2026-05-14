'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock, MapPin, Calendar, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function NewFlightPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [aircraftList, setAircraftList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    aircraft_id: '',
    date: new Date().toISOString().split('T')[0],
    origin: '',
    destination: '',
    engine_start: '',
    takeoff: '',
    landing: '',
    engine_stop: '',
  });

  useEffect(() => {
    async function loadAircraft() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('aircraft')
          .select('id, registration, model');
        
        if (error) throw error;
        setAircraftList(data || []);
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, aircraft_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error loading aircraft:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAircraft();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // Clear error when typing
  };

  // Helper to get raw minutes from "HH:MM" for sequence validation
  const getMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper to combine date and time into TIMESTAMPTZ ISO String
  const createTimestamp = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString();
  };

  const calculateHours = (startStr: string, endStr: string) => {
    const startMins = getMinutes(startStr);
    let endMins = getMinutes(endStr);
    
    // Handle overnight flights (simple approach: if end < start, it's next day)
    if (endMins < startMins) {
      endMins += 24 * 60;
    }
    
    return (endMins - startMins) / 60.0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. SEQUENCE VALIDATION
    const tEngineStart = getMinutes(formData.engine_start);
    const tTakeoff = getMinutes(formData.takeoff);
    const tLanding = getMinutes(formData.landing);
    const tEngineStop = getMinutes(formData.engine_stop);

    // Strict Sequence Check (assuming same day flight for MVP validation)
    // If they fly over midnight, they need a more robust date-time picker.
    // For MVP, we'll enforce strict chronological sequence.
    if (tTakeoff < tEngineStart) {
      setErrorMsg('A decolagem não pode ser anterior ao acionamento do motor.');
      return;
    }
    if (tLanding < tTakeoff) {
      setErrorMsg('O pouso não pode ser anterior à decolagem.');
      return;
    }
    if (tEngineStop < tLanding) {
      setErrorMsg('O corte do motor não pode ser anterior ao pouso.');
      return;
    }

    // 2. CALCULATE DURATIONS
    const flightHours = calculateHours(formData.takeoff, formData.landing);
    const engineHours = calculateHours(formData.engine_start, formData.engine_stop);

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('flight_logs').insert({
        aircraft_id: formData.aircraft_id,
        pic_id: user?.id,
        date: formData.date,
        origin: formData.origin.toUpperCase(),
        destination: formData.destination.toUpperCase(),
        engine_start: createTimestamp(formData.date, formData.engine_start),
        takeoff: createTimestamp(formData.date, formData.takeoff),
        landing: createTimestamp(formData.date, formData.landing),
        engine_stop: createTimestamp(formData.date, formData.engine_stop),
        total_flight_hours: flightHours,
        engine_time: engineHours,
        status: 'signed'
      });

      if (error) throw error;
      
      router.push('/dashboard');
      router.refresh(); // Refresh to update KPIs
    } catch (err: any) {
      console.error('Erro ao salvar voo:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao salvar o registro de voo.');
      setIsSubmitting(false);
    }
  };

  // Preview Calculations for UI feedback
  const previewFlightHours = formData.takeoff && formData.landing ? calculateHours(formData.takeoff, formData.landing).toFixed(1) : '0.0';
  const previewEngineHours = formData.engine_start && formData.engine_stop ? calculateHours(formData.engine_start, formData.engine_stop).toFixed(1) : '0.0';

  if (isLoading) {
    return <div className="p-8 text-slate-400">Carregando formulário...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Registro de Voo</h1>
          <p className="text-slate-400">Preencha o diário de bordo com as horas de relógio.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: General Info */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Plane className="w-5 h-5 mr-2 text-sky-400" />
            Informações do Voo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Aeronave</label>
              <select
                name="aircraft_id"
                value={formData.aircraft_id}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors appearance-none"
              >
                {aircraftList.map((ac) => (
                  <option key={ac.id} value={ac.id}>{ac.registration} ({ac.model})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Data do Voo</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Origem (ICAO)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="origin"
                  placeholder="SBSP"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  maxLength={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white uppercase focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Destino (ICAO)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="destination"
                  placeholder="SBJD"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  maxLength={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white uppercase focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Chronology */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-emerald-400" />
            Cronologia (Horário Local)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">1. Motor (ON)</label>
              <input
                type="time"
                name="engine_start"
                value={formData.engine_start}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">2. Decolagem</label>
              <input
                type="time"
                name="takeoff"
                value={formData.takeoff}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">3. Pouso</label>
              <input
                type="time"
                name="landing"
                value={formData.landing}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">4. Motor (OFF)</label>
              <input
                type="time"
                name="engine_stop"
                value={formData.engine_stop}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Summary & Submit */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between">
          <div className="flex space-x-8 mb-6 md:mb-0">
            <div>
              <p className="text-sm text-slate-400 font-medium">Tempo de Voo</p>
              <p className="text-2xl font-bold text-white">{previewFlightHours}h</p>
            </div>
            <div className="w-px h-12 bg-slate-800"></div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Tempo de Motor <span className="text-xs text-sky-400 ml-1">(Será somado à aeronave)</span></p>
              <p className="text-2xl font-bold text-white">{previewEngineHours}h</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center transition-all shadow-lg shadow-sky-500/20"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Registrar Voo
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
