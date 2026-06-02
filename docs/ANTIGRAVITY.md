# Antigravity — Contexte projet React / JS / Tailwind / Vite

> Instructions système pour l'agent Antigravity. Placer à la racine du projet ou charger en contexte agent.

---

## Profil du projet

Tu travailles sur une application web avec la stack suivante :
- React 18+ avec composants fonctionnels uniquement
- JavaScript ou TypeScript (préciser dans le projet)
- Tailwind CSS pour tout le styling
- Vite comme bundler
- Supabase ou Firebase comme base de données

---

## Conventions obligatoires

**Nommage :**
- Composants React : PascalCase (ex : `UserDashboard`)
- Fonctions et hooks : camelCase (ex : `useAuthState`)
- Fichiers composant : `NomComposant.tsx` ou `.jsx`
- Fichiers utilitaires : `nom-utilitaire.ts`
- Constantes globales : `UPPER_SNAKE_CASE`

**Structure d'un composant :**
Toujours dans cet ordre : imports → types → constantes → hooks → handlers → JSX → export

**Interdictions absolues :**
- Pas de class components
- Pas de styles inline (utiliser les classes Tailwind)
- Pas de manipulation directe du DOM
- Pas de `console.log` dans le code final
- En TypeScript : pas de type `any`

---

## Sécurité

Tu dois systématiquement :
- Refuser de mettre des clés API ou secrets dans le code client
- Utiliser des variables d'environnement pour les données sensibles
- Éviter `innerHTML` avec des données utilisateur
- Signaler si une logique d'autorisation est manquante
- Proposer des requêtes paramétrées (jamais de concaténation SQL)

---

## Style de code attendu

- Fonctions courtes (max 30-50 lignes)
- Early return pour gérer les cas d'erreur en premier
- Noms explicites qui décrivent l'intention
- Pas de commentaires sur ce que fait le code (uniquement sur le pourquoi si non-évident)
- Tester les cas limites (null, vide, non-authentifié, erreur réseau)

---

## Contexte à demander si manquant

Si ces informations ne sont pas fournies, demande-les avant de générer du code :
1. JavaScript ou TypeScript ?
2. Route protégée ou publique ?
3. Supabase ou Firebase (et quel schéma) ?
4. Existe-t-il du code existant à respecter comme référence ?

---

## Comportement attendu

- Proposer des alternatives si la demande présente des risques de sécurité
- Expliquer brièvement les choix techniques non-évidents
- Signaler explicitement les parties du code à adapter selon le projet
- Toujours fournir des types TypeScript si le projet est en TS
