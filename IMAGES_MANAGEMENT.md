# Gestion des images Galerie

## Vue d'ensemble

Les images de la galerie se trouvent dans le dossier : `src/galery/`

Quand tu ajoutes ou supprimes des images du dossier, tu dois **mettre à jour manuellement** la liste dans le service.

## Ajouter une image

### Étape 1 : Ajoute le fichier image

Place ton fichier image dans le dossier `src/galery/` :
```
c:\wamp64\www\auradhom-v2\src\galery\
  └── mon-image.jpg   ← Ton image
```

### Étape 2 : Mets à jour le service

Ouvre le fichier `src/app/services/gallery.service.ts` et ajoute le nom du fichier à l'array `imageFilenames` :

```typescript
private initializeData(): void {
  const imageFilenames = [
    '1.jpg',
    '2.jpg',
    // ... autres images ...
    'mon-image.jpg'  ← Ajoute ici
  ];
```

### Étape 3 : Redémarre le serveur

```powershell
npm start
```

L'image apparaîtra automatiquement dans la galerie, catégorisée selon son nom :
- Commence par `T`, `img` → **T-Shirts**
- Commence par `P`, `p` → **Posters**
- Commence par `S` → **Stickers**
- Commence par `cover`, `Y` → **Covers**
- Autre → **Artworks**

## Supprimer une image

### Étape 1 : Supprime le fichier

Supprime le fichier du dossier `src/galery/` :

```powershell
# Exemple : supprimer vvvv.jpg
Remove-Item c:\wamp64\www\auradhom-v2\src\galery\vvvv.jpg
```

### Étape 2 : Mets à jour le service

Ouvre `src/app/services/gallery.service.ts` et supprime la ligne correspondante de l'array `imageFilenames` :

```typescript
const imageFilenames = [
  '1.jpg',
  '2.jpg',
  // ...
  // 'vvvv.jpg'  ← Supprime cette ligne
  'W1.jpeg',
];
```

### Étape 3 : Redémarre le serveur

```powershell
npm start
```

## État actuel des images

**Dossier** : `c:\wamp64\www\auradhom-v2\src\galery\`
**Total** : 27 images

### Fichiers présents :

```
1.jpg
2.jpg
3.jpg
4.jpg
5.jpg
cover2.jpg
im1.png
im2.jpeg
img (1).jpeg
img (2).jpeg
img (4).jpeg
img (5).jpeg
img (6).jpeg
img (7).jpeg
img (8).jpeg
p1.jpeg
p2.jpeg
p3.jpeg
p4.jpeg
T0.jpeg
TS1.jpeg
vvvv.jpg
W1.jpeg
W2.jpeg
W3.png
Y1.jpeg
Y2.jpg
```

### Fichiers supprimés (anciens) :

```
B1.jpg
B2.jpg
cover0.jpg
cover1.jpg
cover3.jpeg
cover4.jpg
img (3).jpeg
S1.jpg
S2.jpg
S3.jpg
S4.jpg
S5.jpg
T1.jpeg
T2.jpeg
T3.jpg
```

## Renommer une image

### Pour renommer une image :

1. **Renomme le fichier** dans `src/galery/`
2. **Mets à jour** le nom dans `gallery.service.ts` `imageFilenames` array
3. **Redémarre** le serveur (`npm start`)

**Exemple** :
```typescript
// Avant
const imageFilenames = [
  'mon-image.jpg',
  // ...
];

// Après (renommée en "mon-nouveau-nom.jpg")
const imageFilenames = [
  'mon-nouveau-nom.jpg',
  // ...
];
```

## Optimiser les images

Pour de meilleures performances, compresse les images avant de les ajouter :

### Outils recommandés :
- **TinyPNG** (https://tinypng.com) — compresse JPG/PNG online
- **ImageOptim** (Mac) ou **FileOptimizer** (Windows) — batch compression
- **FFmpeg** (CLI) :
  ```bash
  ffmpeg -i input.jpg -q:v 8 output.jpg
  ```

### Dimensions recommandées :
- **Carré** : 1200x1200px minimum (meilleur rendu)
- **Format** : JPEG (photos) ou PNG (avec transparence)
- **Taille** : ~200-300 KB par image pour bon compromis vitesse/qualité

## Catégorisation automatique

Les images sont classées par catégorie selon leur **nom** :

| Préfixe | Catégorie |
|---------|-----------|
| `T`, `img` | T-Shirts |
| `P`, `p` | Posters |
| `S` | Stickers |
| `cover`, `Y` | Covers |
| Autre | Artworks |

**Exemple** :
- `img (1).jpeg` → T-Shirts
- `p1.jpeg` → Posters
- `S1.jpg` → Stickers (supprimée)
- `cover2.jpg` → Covers
- `vvvv.jpg` → Artworks
- `1.jpg` → Artworks

Pour changer la catégorie d'une image, **renomme-la** avec le bon préfixe.

## Bulkifier / Automatiser

Si tu as beaucoup d'images à ajouter, tu peux :

1. **Générer la liste** (PowerShell) :
   ```powershell
   $images = Get-ChildItem c:\wamp64\www\auradhom-v2\src\galery -File | Select-Object -ExpandProperty Name
   $images | ForEach-Object { "'$_'," } | Set-Clipboard
   # Collé dans l'array imageFilenames
   ```

2. **Créer un script** pour générer `gallery.service.ts` automatiquement (TypeScript/Node.js) — à la demande.

## FAQ

### Q : Les images ne s'affichent pas après modification ?
**A** : Redémarre le serveur (`npm start`). Vérifies aussi que les fichiers existent dans `src/galery/` avec la bonne orthographe.

### Q : Où mettre les images ?
**A** : **Uniquement** dans `c:\wamp64\www\auradhom-v2\src\galery\`. Ne crée pas de sous-dossiers.

### Q : Peux-tu organiser les images en sous-dossiers ?
**A** : Actuellement non (la config Angular n'inclut pas les sous-dossiers). Si tu veux, il faut modifier `angular.json` et le service. Dis-le-moi !

### Q : Comment filtrer par catégorie ?
**A** : C'est automatique via le **nom du fichier**. Renomme l'image avec le bon préfixe (voir tableau Catégorisation).

### Q : Comment ajouter des tags customisés ?
**A** : Modifie le tableau `tags` dans `gallery.service.ts` et la logique de catégorisation si besoin. Actuellement, les tags sont assignés aléatoirement.

---

**Dernière mise à jour** : 14/11/2025  
**Version** : 1.0 (27 images)
