# Page Galerie — Documentation

## Vue d'ensemble

Page de galerie moderne, responsive et premium intégrée au site AURADHOM. Affiche des images du dossier `src/galery/` avec filtrage, tri, pagination et lightbox.

## Architecture

### Fichiers créés/modifiés

- **`gallery.component.ts`** — Logique principale (filtres, pagination, lightbox state)
- **`gallery.component.html`** — Template (filtres, grille, lightbox)
- **`gallery.component.css`** — Styles (responsive grid, hover, lightbox)
- **`../services/gallery.service.ts`** — Service de données (fetch, filter, sort)
- **`../app.routes.ts`** — Route `/galerie` ajoutée
- **`../components/header/header.component.html`** — Lien "Galerie" dans nav
- **`../components/header/header.component.ts`** — RouterLinkActive import
- **`../components/header/header.component.css`** — Style active state
- **`angular.json`** — Assets config mise à jour pour servir `/galery/`

### Configuration Assets (angular.json)

Pour que les images s'affichent, la config Angular doit copier le dossier `galery` vers le build output :

```json
"assets": [
  {
    "glob": "**/*",
    "input": "src/galery",
    "output": "/galery"
  }
]
```

**Important** : Après modification de `angular.json`, tu DOIS redémarrer le serveur de dev (`npm start`).

## Data Model

### GalleryImage

```typescript
interface GalleryImage {
  id: number;
  title?: string;
  alt?: string;
  url: string;              // chemin complet (ex: /galery/image.jpg)
  thumb: string;            // identique à url (pas de resize client-side)
  category?: string;        // T-Shirts, Posters, Stickers, Artworks, Covers
  tags?: string[];
  views?: number;
  createdAt?: string;
  featured?: boolean;
}
```

### Catégorisation automatique (basée sur nom fichier)

- `T*`, `img (*)` → T-Shirts
- `P*`, `p*` → Posters
- `S*` → Stickers
- `cover*`, `Y*` → Covers
- Autres → Artworks

## Fonctionnalités

### ✅ Implémentées

1. **Filtres en haut**
   - Recherche rapide (debounce possible)
   - Sélection catégorie
   - Tri (plus récents, plus vus, mis en avant)
   - Bouton Réinitialiser

2. **Grille Responsive**
   - 2 colonnes < 640px (mobile)
   - 3 colonnes 640–1024px (tablette)
   - 4 colonnes 1024–1440px (desktop)
   - 5 colonnes ≥ 1440px (large desktop)
   - Lazy-loading images (`loading="lazy"`)
   - Hover effects (zoom 1.07x, shadow, translateY -6px)

3. **Lightbox**
   - Vue pleine écran
   - Navigation prev/next
   - Fermeture (ESC ou click backdrop)
   - Légende image
   - Focus bloqué sur overlay

4. **Pagination**
   - Bouton "Voir plus" (Load more)
   - 24 items par page (configurable)
   - Chargement progressif

### 🔧 À faire / Améliorations futures

- [ ] Debounce recherche (RxJS `debounceTime(300)`)
- [ ] Focus trapping + restore after lightbox close
- [ ] Clavier : flèches gauche/droite dans lightbox (déjà partiellement implémenté)
- [ ] Support swipe tactile dans lightbox
- [ ] Image preloading (next/prev dans lightbox)
- [ ] Tests unitaires (Karma/Jest)
- [ ] Accessibilité avancée (aria-current, aria-live pour compteur)
- [ ] API réelle (remplacer mock data par HTTP GET)

## Usage

### Accès

```
http://localhost:4200/galerie
```

### Filtrer images (TypeScript)

```typescript
const result = this.galleryService.fetch(page, perPage, {
  category: 'T-Shirts',
  q: 'minimal',
  sort: 'newest'
});
console.log(result.items, result.meta);
```

### Options fetch()

```typescript
fetch(
  page: number = 1,
  perPage: number = 24,
  opts?: {
    category?: string;      // "All", "T-Shirts", "Posters", "Stickers", "Artworks", "Covers"
    tags?: string[];        // ["minimal", "vintage", ...]
    q?: string;             // search query
    sort?: string;          // "newest" | "most_viewed" | "featured"
  }
): FetchResult
```

## Tests

### Smoke Tests (manuels)

1. **Chargement images**
   - [ ] Ouvre `/galerie`, vérifies que les images s'affichent
   - [ ] Laptop : 5 colonnes de 4 images (20 visible)
   - [ ] Tablet (iPad) : 4 colonnes
   - [ ] Mobile : 2 colonnes

2. **Filtres**
   - [ ] Change catégorie → grille se met à jour
   - [ ] Tape dans recherche → images filtrées
   - [ ] Sélectionne tri → ordre change
   - [ ] Clic "Réinitialiser" → tout revient à défaut

3. **Pagination**
   - [ ] Scroll vers bas → button "Voir plus" visible
   - [ ] Clic "Voir plus" → 24 plus d'images chargées
   - [ ] Pas de doublons

4. **Lightbox**
   - [ ] Clic image → lightbox ouvre, scroll bloqué
   - [ ] Clic prev/next → image change
   - [ ] ESC → lightbox ferme, scroll débloqué
   - [ ] Clic sur fond noir → ferme aussi

5. **Responsive**
   - [ ] 375px (mobile) : 2 col, filtres OK
   - [ ] 768px (tablet) : 3 col, filtres OK
   - [ ] 1440px+ (desktop) : 5 col, filtres réactifs

6. **Accessibilité**
   - [ ] Tab nav : tous les inputs/boutons atteignables
   - [ ] Lightbox fermable au clavier (ESC)
   - [ ] Images ont alt attributes

## Intégration API réelle

Pour remplacer le mock data par une vraie API, modifier `gallery.service.ts` :

```typescript
constructor(private http: HttpClient) { }

fetch(page = 1, perPage = 24, opts?: { ... }): FetchResult | Observable<FetchResult> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('perPage', perPage.toString())
    .set('category', opts?.category || 'All')
    .set('q', opts?.q || '');
  
  return this.http.get<FetchResult>('/api/gallery', { params });
}
```

Puis adapter le composant pour utiliser `async | pipe` ou `toSignal()`.

## Dépannage

### Images ne s'affichent pas

1. Vérifie que `src/galery/` contient les images
2. Vérifies que `angular.json` a la config assets pour `galery` (voir section Configuration Assets)
3. **Redémarre le serveur** : `npm start` (après modif angular.json)
4. Ouvre console dev (F12) → onglet Network → vérifies que les images requêtées retournent 200
5. Cherche les erreurs console (console.log, network errors)

### Filtres ne fonctionnent pas

- Vérifies que `FormsModule` est importé dans `gallery.component.ts`
- Vérifies que `[(ngModel)]` bind correctement les variables
- Cherche console errors

### Lightbox ne ferme pas

- Vérifies ESC listener dans le composant (à ajouter si manquant)
- Vérifie que `closeLightbox()` est bien appelée

## Performance

- **Lazy-loading** : images chargées au scroll vers le viewport
- **Pagination** : 24 items par page (bon compromis perf/UX)
- **Debounce** : à ajouter sur recherche (300ms)
- **Preload** : images next/prev dans lightbox (à impl)

## Style / Charte

- Utilise variables CSS : `--sand`, `--white`, `--text-primary`, `--text-secondary`, `--gray-dark`, `--background`
- Typographie : Space Mono (heading), Inter (body) — réutilisée depuis l'app
- Ombres : soft shadows (0 8px 24px rgba(0,0,0,0.25)) au hover
- Transition : 320–450ms cubic-bezier smooth
- Couleur active : `--sand` (#D8D2C9)

## Fichiers de source

### Images locales

Dossier : `src/galery/`
Copié vers : `dist/demo/galery/` (build) → accessible via `/galery/` (browser)

Total : 41 images (1.jpg, B1.jpg, cover0.jpg, ..., Y2.jpg)

## Commits (suggérés)

```bash
git add src/app/pages/gallery/
git commit -m "feat: add gallery page with filters, pagination, lightbox"

git add src/app/services/gallery.service.ts
git commit -m "feat: add gallery service with local images"

git add src/app/components/header/
git add src/app/app.routes.ts
git commit -m "feat: connect gallery to header nav"

git add angular.json
git commit -m "build: add galery assets to Angular build config"
```

---

**Dernière mise à jour** : 14/11/2025
**Version** : 1.0 (MVP)
