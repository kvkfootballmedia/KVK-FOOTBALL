'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const GENERIC_ERROR = 'Identifiants invalides ou acces non autorise.';

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        console.error('[login] auth:', authError?.message);
        setError(GENERIC_ERROR);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        console.error('[login] profile:', profileError?.message);
        await supabase.auth.signOut();
        setError(GENERIC_ERROR);
        return;
      }

      if (!['admin', 'editor', 'author'].includes(profile.role)) {
        console.error('[login] role:', profile.role);
        await supabase.auth.signOut();
        setError(GENERIC_ERROR);
        return;
      }

      router.push('/admin');
      router.refresh();

    } catch (err: any) {
      console.error('[login] unexpected:', err?.message);
      setError(GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-[0.5em] text-primary mb-4 block">
            Portail Prive
          </span>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic border-b-4 border-gray-900 pb-2 inline-block">
            Connexion
          </h1>
          <p className="mt-6 text-gray-400 font-serif italic text-lg">
            Espace de redaction KVK Football
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-gray-900 transition-all outline-none font-bold placeholder:text-gray-200"
              placeholder="redaction@kvkfootball.fr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Mot de Passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-gray-900 transition-all outline-none font-bold"
            />
          </div>

          {error && (
            <p className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 p-4 border-l-4 border-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? 'Identification...' : 'Se Connecter'}
          </button>
        </form>

        <div className="pt-12 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
            Acces reserve au personnel autorise uniquement.
          </p>
        </div>
      </div>
    </div>
  );
}
