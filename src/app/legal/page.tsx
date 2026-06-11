export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-16 border-b-8 border-primary pb-4 inline-block">Mentions Légales</h1>
      
      <div className="prose prose-lg font-serif text-gray-800 space-y-12">
        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">1. Édition du site</h2>
          <p>
            Le présent site, accessible à l’URL <strong>www.kvk-football.com</strong>, est édité par :<br />
            <strong>Collectif KVK Media</strong>, association loi 1901 immatriculée au R.P.A de Paris.<br />
            Siège social : 12 Rue du Ballon Rond, 75000 Paris.<br />
            Directeur de la publication : Équipe KVK Football.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">2. Hébergement</h2>
          <p>
            Le site est hébergé par la société <strong>Vercel Inc.</strong>, située au 340 S Lemon Ave #1142 Walnut, CA 91789, États-Unis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">3. Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus (textes, analyses, graphismes, logos) présents sur le site sont la propriété exclusive du Collectif KVK Media, sauf mention contraire. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable.
          </p>
        </section>

        <section className="pt-12 text-sm text-gray-400 font-sans italic">
          Dernière mise à jour : 4 Février 2026.
        </section>
      </div>
    </div>
  );
}
