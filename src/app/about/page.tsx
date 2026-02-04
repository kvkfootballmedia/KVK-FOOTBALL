export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-6xl font-black uppercase tracking-tighter mb-12 text-center">À propos de KVK Football</h1>
      
      <div className="font-serif text-xl leading-relaxed text-gray-800 space-y-8">
        <p className="font-bold text-2xl text-gray-900 italic">
          "Le football est une chose sérieuse, mais il mérite d'être raconté avec élégance et profondeur."
        </p>
        
        <p>
          KVK Football est un média indépendant fondé par des passionnés de culture footballistique et d'analyse tactique. Dans un monde saturé d'informations éphémères et de "clashs" inutiles, nous avons choisi de prendre le temps.
        </p>

        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 pt-8">Notre Philosophie</h2>
        <p>
          Nous croyons que le football ne se résume pas à 90 minutes sur le terrain. C'est un prisme à travers lequel on peut observer la société, l'économie, la politique et l'art. Nos articles cherchent à explorer ces dimensions, en offrant des clés de lecture inédites.
        </p>

        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 pt-8">L'Équipe</h2>
        <p>
          Notre rédaction est composée d'auteurs, de tacticiens et d'enquêteurs qui partagent une même vision : l'exigence éditoriale au service du lecteur. Nous ne sommes pas une agence de presse, nous sommes un laboratoire d'idées.
        </p>
      </div>

      <div className="mt-24 pt-12 border-t-4 border-primary text-center">
        <p className="font-bold uppercase tracking-widest text-sm mb-4">Rejoignez l'aventure</p>
        <p className="text-gray-500 italic">Pour toute collaboration ou proposition de sujet : contact@kvkfootball.fr</p>
      </div>
    </div>
  );
}
