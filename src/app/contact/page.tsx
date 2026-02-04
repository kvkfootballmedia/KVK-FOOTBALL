import Button from "@/components/ui/Button";
import { Mail, MapPin, Facebook, Youtube, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 italic">Contactez la rédaction</h1>
          <p className="text-xl text-gray-600 font-serif leading-relaxed mb-12">
            Une suggestion de sujet ? Une demande d'interview ou une proposition de collaboration ? Notre équipe est à votre écoute.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-sm text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Email Editorial</h4>
                <p className="text-lg font-serif">redaction@kvkfootball.fr</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-sm text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Bureaux</h4>
                <p className="text-lg font-serif">12 Rue du Ballon Rond, 75000 Paris</p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
               <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-gray-400">Suivez-nous sur les réseaux</h4>
               <div className="flex gap-4">
                  <a href="https://x.com/kvkfootball?s=21" target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-900 text-white rounded-sm hover:bg-primary transition-all group" title="X (Twitter)">
                    <svg className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/kvkfootball?mibextid=wwXIfr&rdid=lc7TMNjifPafBgu5&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CgQJDr1Pk%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-900 text-white rounded-sm hover:bg-primary transition-all group" title="Facebook">
                    <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="https://www.youtube.com/@kvk100football" target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-900 text-white rounded-sm hover:bg-primary transition-all group" title="YouTube">
                    <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="https://api.whatsapp.com/send/?phone=221765948961&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-900 text-white rounded-sm hover:bg-primary transition-all group" title="WhatsApp">
                    <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </a>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-8 md:p-12 shadow-2xl rounded-sm">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Prénom</label>
                <input type="text" className="w-full border-b border-gray-200 py-3 focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nom</label>
                <input type="text" className="w-full border-b border-gray-200 py-3 focus:border-primary outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Votre Email</label>
              <input type="email" className="w-full border-b border-gray-200 py-3 focus:border-primary outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Sujet</label>
              <select className="w-full border-b border-gray-200 py-3 focus:border-primary outline-none transition-colors bg-white">
                <option>Propotion d'article</option>
                <option>Correctif / Erreur</option>
                <option>Publicité & Partenariats</option>
                <option>Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Message</label>
              <textarea className="w-full border border-gray-100 p-4 rounded-sm h-40 focus:border-primary outline-none transition-colors font-serif" placeholder="Dites-nous tout..."></textarea>
            </div>

            <Button className="w-full py-4 text-sm" variant="primary">Envoyer le message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
