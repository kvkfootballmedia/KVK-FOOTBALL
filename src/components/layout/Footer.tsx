import Link from 'next/link';
import { Facebook, Youtube, Send, Mail, ChevronRight, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-black tracking-tighter">
              KVK<span className="text-primary">FOOTBALL</span>
            </Link>
            <p className="text-gray-400 leading-relaxed font-serif text-lg">
              L'excellence éditoriale au service du décryptage du football. Analyse, rigueur et passion.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com/kvkfootball?s=21" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors" title="X (Twitter)">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/kvkfootball?mibextid=wwXIfr&rdid=lc7TMNjifPafBgu5&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CgQJDr1Pk%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@kvk100football" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors" title="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://api.whatsapp.com/send/?phone=221765948961&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors" title="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-8 border-l-2 border-primary pl-4">Rubriques</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/category/ligue-1" className="hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                  Ligue 1
                </Link>
              </li>
              <li>
                <Link href="/category/mercato" className="hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                  Mercato
                </Link>
              </li>
              <li>
                <Link href="/category/champions-league" className="hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                  Ligue des Champions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-8 border-l-2 border-primary pl-4">Légal</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/legal" className="hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-primary opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 font-medium">
          <p>© {currentYear} KVK Football. Tous droits réservés.</p>
          <div className="flex gap-8">
            <Link href="/terms" className="hover:text-gray-300">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
