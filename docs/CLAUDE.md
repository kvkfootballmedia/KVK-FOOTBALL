# Claude — Contexte projet React / JS / Tailwind / Vite

> Coller ce fichier au début de chaque conversation, ou le placer à la racine du projet.

---

## Stack technique
- **Framework** : React 18+ (functional components uniquement)
- **Langage** : JavaScript / TypeScript (préciser lequel dans le projet)
- **Styling** : Tailwind CSS (pas de CSS-in-JS, pas de styles inline)
- **Build** : Vite
- **State** : useState / useReducer / Zustand (pas Redux sauf besoin justifié)
- **Data fetching** : TanStack Query (React Query) ou SWR
- **Routing** : React Router v6+ ou Next.js (préciser)
- **BDD** : Supabase ou Firebase (voir dossiers dédiés)

---

## Conventions de code à respecter

### Nommage
```
Composants       → PascalCase        (UserProfile, OrderCard)
Fonctions/hooks  → camelCase         (getUserData, useAuthState)
Fichiers compo.  → PascalCase.tsx    (UserProfile.tsx)
Fichiers utils   → kebab-case.ts     (format-date.ts)
Constantes       → UPPER_SNAKE_CASE  (MAX_RETRY_COUNT)
```

### Structure composant
```jsx
// Ordre toujours respecté dans un composant
1. Imports
2. Types/interfaces
3. Constantes locales
4. Composant (function)
   - hooks en premier
   - handlers ensuite
   - return JSX en dernier
5. Export default
```

### Règles strictes
```
- Jamais de class components
- Jamais d'inline styles (utiliser Tailwind)
- Jamais de manipulation directe du DOM
- Jamais de console.log en production
- Pas d'any en TypeScript (sauf cas documenté)
- useEffect avec dépendances explicites et commentaire si vide []
- Clés de liste : jamais l'index si la liste peut être réordonnée
```

---

## Sécurité — règles non-négociables

```
- Aucune clé API, secret ou token dans le code client
- Toutes les variables sensibles dans .env (jamais commitées)
- Pas d'innerHTML avec données utilisateur (XSS) → utiliser DOMPurify si besoin
- Auth côté serveur toujours (ne pas se fier uniquement au client)
- Sanitiser les inputs avant envoi
- CORS configuré côté serveur (pas de wildcard en production)
```

---

## Performance

```
- Lazy loading des routes (React.lazy + Suspense)
- useMemo/useCallback uniquement si profiling prouve un problème
- Images optimisées (WebP, dimensions explicites)
- Éviter les re-renders inutiles (composition plutôt que context pour state fréquent)
- Bundle analysis avant mise en prod (vite-bundle-analyzer)
```

---

## Contexte à me fournir pour travailler efficacement

Avant de demander du code, précise :
1. **Composant/feature concerné** et son rôle dans l'app
2. **Code existant** à respecter comme référence de style (coller un extrait)
3. **Route protégée ou publique** (contexte auth)
4. **BDD utilisée** : Supabase ou Firebase (schéma si pertinent)
5. **TypeScript ou JavaScript** dans ce projet

---

## Ce que je dois éviter dans ce projet

> À compléter selon ton projet spécifique

- [ ] Ne pas utiliser [bibliothèque X] car [raison]
- [ ] Ne pas modifier [fichier/composant Y] sans discussion
- [ ] Respecter le pattern [Z] utilisé dans [exemple]

---

## Règles métier critiques

> À remplir selon ton projet

- [Décrire ici les règles métier non-évidentes]
- [Ex : les utilisateurs free ne peuvent pas accéder à /feature avant vérification]

---

## Modes d'optimisation — activer en début de session

**Modèle par défaut : Sonnet** → Haiku (tâches simples) · Opus (archi/sécu/bugs complexes)

### "mode concis" (caveman — source : github.com/JuliusBrussee/caveman)
Fragments de phrases. Pas de récapitulatif. Pas de "Bien sûr !". Résultat direct.
Niveaux : `lite` (supprime le remplissage) · `full` (défaut) · `ultra` (une ligne par point)
Économie mesurée : 40–87% des tokens de réponse.

### "mode contexte minimal" (source : code-review-graph)
Ne lire que les fichiers explicitement mentionnés ou directement impactés par le changement.
Ne jamais charger le projet entier. Si le fichier manque → demander lequel, pas deviner.
Économie mesurée : 6.9× à 8.2× moins de tokens sur les reviews.

### "mode delta" (source : token-optimizer)
Sur les re-lectures d'un fichier déjà lu dans cette session : retourner uniquement les lignes
modifiées, pas le fichier complet. "Fichier X mis à jour — lignes 42-51 modifiées."
Économie mesurée : 97% sur les re-lectures typiques.

### Filtrage bash (source : rtk — github.com/rtk-ai/rtk)
Toujours actif : résumer les outputs de commandes au lieu de les dumper bruts.
- `git status` → "3 fichiers modifiés : X, Y, Z"
- test runner → "12 tests · 1 échec · UserService:45"
- lint → "4 warnings · 0 errors · fichiers : A, B"
Économie mesurée : 80% des tokens de session sur les opérations bash.

> Guide complet : `BASE-REFERENCE/TOKEN-OPTIMIZATION.md`
