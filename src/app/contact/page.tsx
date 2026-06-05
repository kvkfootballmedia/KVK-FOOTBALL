'use client';

import { useState } from 'react';
import { Mail, MessageCircle, CheckCircle, Send } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: 'e3afdd45-0044-4258-80d6-25f310fd2b65', ...data }),
    });
    if (res.ok) { setStatus('success'); form.reset(); }
    else setStatus('error');
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero compact mobile */}
      <div className="bg-gray-900 px-4 py-10 md:py-20 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-3">KVK Football</p>
        <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white leading-tight">
          Contactez<br className="md:hidden" /> la rédaction
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-serif mt-3 max-w-md mx-auto leading-relaxed">
          Suggestion, collaboration ou partenariat — on vous répond.
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">

          {/* Infos — mobile : horizontal compact */}
          <div className="space-y-4 md:space-y-8">

            {/* Email */}
            <a href="mailto:kvkfootballmedia@gmail.com"
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Email</p>
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">kvkfootballmedia@gmail.com</p>
              </div>
            </a>

            {/* Réseaux */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Réseaux sociaux</p>
              <div className="grid grid-cols-4 gap-2">
                <a href="https://x.com/kvkfootball?s=21" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-900 text-white rounded-lg hover:bg-primary transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[8px] font-bold uppercase tracking-wide">X</span>
                </a>
                <a href="https://www.facebook.com/kvkfootball?mibextid=wwXIfr&rdid=lc7TMNjifPafBgu5&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CgQJDr1Pk%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-900 text-white rounded-lg hover:bg-primary transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                  <span className="text-[8px] font-bold uppercase tracking-wide">Facebook</span>
                </a>
                <a href="https://www.youtube.com/@kvk100football" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-900 text-white rounded-lg hover:bg-primary transition-all">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  <span className="text-[8px] font-bold uppercase tracking-wide">YouTube</span>
                </a>
                <a href="https://api.whatsapp.com/send/?phone=221765948961&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-900 text-white rounded-lg hover:bg-primary transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-wide">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
                <CheckCircle className="w-14 h-14 text-green-500" />
                <h3 className="text-xl font-black uppercase tracking-tight">Message envoyé !</h3>
                <p className="text-gray-500 font-serif text-sm">On revient vers vous rapidement.</p>
                <button onClick={() => setStatus('idle')}
                  className="mt-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-primary hover:text-primary transition-colors">
                  Nouveau message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Prénom</label>
                    <input name="prenom" type="text" required
                      className="w-full border-b border-gray-200 py-2.5 text-sm focus:border-primary outline-none transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Nom</label>
                    <input name="nom" type="text" required
                      className="w-full border-b border-gray-200 py-2.5 text-sm focus:border-primary outline-none transition-colors bg-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Email</label>
                  <input name="email" type="email" required
                    className="w-full border-b border-gray-200 py-2.5 text-sm focus:border-primary outline-none transition-colors bg-transparent" />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Sujet</label>
                  <select name="sujet"
                    className="w-full border-b border-gray-200 py-2.5 text-sm focus:border-primary outline-none transition-colors bg-white">
                    <option>Proposition d'article</option>
                    <option>Correctif / Erreur</option>
                    <option>Publicité & Partenariats</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Message</label>
                  <textarea name="message" required rows={5}
                    className="w-full border border-gray-100 p-3 rounded-lg text-sm focus:border-primary outline-none transition-colors font-serif resize-none"
                    placeholder="Dites-nous tout..." />
                </div>

                {status === 'error' && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                    Erreur — écrivez à kvkfootballmedia@gmail.com
                  </p>
                )}

                <button type="submit" disabled={status === 'sending'}
                  className="w-full py-3.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" />
                  {status === 'sending' ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
