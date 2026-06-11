export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-16 border-b-8 border-primary pb-4 inline-block">Politique de confidentialité</h1>
      
      <div className="prose prose-lg font-serif text-gray-800 space-y-12">
        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Qui sommes-nous ?</h2>
          <p>
            L’adresse de notre site est : <strong>https://kvk-football.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Commentaires</h2>
          <p>
            Lorsque vous laissez un commentaire sur notre site, les données inscrites dans le formulaire de commentaire, ainsi que votre adresse IP et la chaîne agent utilisateur de votre navigateur, sont collectées pour nous aider à la détection des commentaires indésirables.
          </p>
          <p>
            Une chaîne anonymisée créée à partir de votre adresse e-mail (aussi appelée hash) peut être transmise au service Gravatar pour vérifier si vous utilisez ce dernier. La politique de confidentialité du service Gravatar est disponible ici : <a href="https://automattic.com/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://automattic.com/privacy/</a>.
            Après validation de votre commentaire, votre photo de profil sera visible publiquement à côté de votre commentaire.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Médias</h2>
          <p>
            Si vous téléversez des images sur le site, nous vous conseillons d’éviter d’envoyer des images contenant des données de localisation intégrées (EXIF GPS).
            Les visiteurs du site peuvent télécharger et extraire des données de localisation à partir de ces images.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Cookies</h2>
          <p>
            Si vous laissez un commentaire sur notre site, il vous sera proposé d’enregistrer votre nom, adresse e-mail et site web dans des cookies. Cela est uniquement pour votre confort afin de ne pas avoir à saisir ces informations si vous déposez un autre commentaire plus tard. Ces cookies expirent au bout d’un an.
          </p>
          <p>
            Si vous vous rendez sur la page de connexion, un cookie temporaire sera créé afin de déterminer si votre navigateur accepte les cookies. Ce cookie ne contient aucune donnée personnelle et sera supprimé automatiquement à la fermeture de votre navigateur.
          </p>
          <p>
            Lorsque vous vous connectez, plusieurs cookies sont mis en place pour enregistrer vos informations de connexion et préférences d’affichage. Les cookies de connexion durent deux jours, et les cookies d’options d’écran durent un an. Si vous cochez « Se souvenir de moi », votre connexion persistera pendant deux semaines. En vous déconnectant, les cookies de connexion seront supprimés.
          </p>
          <p>
            Si vous modifiez ou publiez un article, un cookie supplémentaire sera enregistré dans votre navigateur. Ce cookie ne contient aucune donnée personnelle. Il indique simplement l’identifiant de l’article que vous venez de modifier. Il expire après un jour.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Contenu embarqué depuis d’autres sites</h2>
          <p>
            Les articles de ce site peuvent inclure des contenus intégrés (par exemple des vidéos, images, articles, etc.).
            Le contenu intégré depuis d’autres sites se comporte de la même manière que si le visiteur se rendait sur cet autre site.
          </p>
          <p>
            Ces sites web peuvent collecter des données vous concernant, utiliser des cookies, embarquer des outils de suivi tiers, et suivre vos interactions avec ces contenus embarqués, notamment si vous disposez d’un compte connecté sur leur site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Avec qui partageons-nous vos données</h2>
          <p>
            Si vous demandez une réinitialisation de mot de passe, votre adresse IP sera incluse dans l’e-mail de réinitialisation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Durées de stockage de vos données</h2>
          <p>
            Si vous laissez un commentaire, le commentaire et ses métadonnées sont conservés indéfiniment. Cela permet de reconnaître et approuver automatiquement les commentaires suivants au lieu de les laisser dans une file de modération.
          </p>
          <p>
            Pour les utilisateurs et utilisatrices qui s’enregistrent sur notre site (si cela est possible), nous stockons également les données personnelles indiquées dans leur profil. 
            Tous les utilisateurs peuvent voir, modifier ou supprimer leurs informations personnelles à tout moment (à l’exception de leur identifiant). Les administrateurs du site peuvent aussi voir et modifier ces informations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Les droits que vous avez sur vos données</h2>
          <p>
            Si vous avez un compte sur le site, ou si vous avez laissé des commentaires, vous pouvez demander à recevoir un fichier contenant toutes les données personnelles que nous détenons à votre sujet, incluant celles que vous nous avez fournies.
            Vous pouvez également demander la suppression des données personnelles vous concernant. Cela ne prend pas en compte les données stockées à des fins administratives, légales ou pour des raisons de sécurité.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">Où vos données sont envoyées</h2>
          <p>
            Les commentaires des visiteurs peuvent être vérifiés à l’aide d’un service automatisé de détection des commentaires indésirables.
          </p>
        </section>

        <section className="pt-12 text-sm text-gray-400 font-sans italic">
          Dernière mise à jour : 4 Février 2026.
        </section>
      </div>
    </div>
  );
}
