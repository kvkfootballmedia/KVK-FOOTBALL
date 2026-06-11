'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail, User, ArrowRight, Loader2, CheckCircle2, LogOut, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email, created_at, role')
          .eq('id', session.user.id)
          .single();
        setProfile(data || { email: session.user.email, created_at: session.user.created_at });
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.refresh();
  };

  if (profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20 mt-10">
        <div className="max-w-md w-full text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-black tracking-tighter text-primary">KVK<span className="text-gray-900">FOOTBALL</span></span>
          </Link>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-white text-3xl font-black uppercase mx-auto mb-6">
              {(profile.full_name || profile.email || '?')[0]}
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-1">
              {profile.full_name || 'Membre'}
            </h2>
            <p className="text-sm text-gray-400 font-serif mb-6">{profile.email}</p>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8">
              <Calendar className="w-3 h-3" />
              Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-primary transition-all text-center">
                Retour au site
              </Link>
              <button onClick={handleLogout} className="w-full py-4 border border-gray-100 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:border-red-200 hover:text-red-500 transition-all flex items-center justify-center gap-2">
                <LogOut className="w-3.5 h-3.5" /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push('/');
        router.refresh();
      } else {
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // The trigger handled profile creation in setup_schema usually,
          // but let's ensure the user knows to check their email if confirmation is on.
          setMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-20 mt-10">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-black tracking-tighter text-primary group">
              KVK<span className="text-gray-900">FOOTBALL</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-4">
            {isLogin ? 'Bon retour' : 'Rejoindre'} <span className="text-primary">le club</span>
          </h1>
          <p className="text-gray-400 font-serif italic text-lg">
            {isLogin 
              ? 'Connectez-vous pour débattre et partager vos avis.' 
              : 'Créez votre compte pour participer à la communauté.'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
          {/* Tabs */}
          <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Connexion
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              S'inscrire
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
                  <User className="w-3 h-3" /> Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-bold text-sm"
                  placeholder="Jean Dupont"
                />
              </div>
            )}

            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-bold text-sm"
                placeholder="nom@exemple.com"
              />
            </div>

            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
                <Lock className="w-3 h-3" /> Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-bold text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border-l-4 border-red-500 animate-in fade-in slide-in-from-left-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div className="p-4 bg-green-50 rounded-2xl border-l-4 border-green-500 animate-in fade-in slide-in-from-left-2 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-green-600">
                  {message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {isLogin ? 'Se Connecter' : 'Créer le compte'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-8 text-center">
               <Link href="/kv0980gp-coffre/login" className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-primary transition-colors">
                  Accès Journalistes / Staff
               </Link>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-gray-400 font-serif italic text-sm">
          En vous connectant, vous acceptez nos conditions de débat et d'utilisation.
        </p>
      </div>
    </div>
  );
}
