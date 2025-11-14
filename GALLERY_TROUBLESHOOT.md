# Guide Dépannage — Images Galerie

## Problème : Les images ne s'affichent pas

### Cause probable
La config `angular.json` a été modifiée pour inclure le dossier `galery` dans les assets, mais le serveur Angular n'a pas été redémarré.

### Solution (3 étapes)

#### Étape 1 : Arrêter le serveur

Si le serveur est en cours d'exécution (`npm start`), arrête-le :
```powershell
Ctrl + C
```

#### Étape 2 : Redémarrer avec `npm start`

```powershell
cd c:\wamp64\www\auradhom-v2
npm start
```

Attends que le build soit terminé (~30-60 sec). Tu devrais voir :
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

#### Étape 3 : Ouvrir `/galerie` et vérifier

1. Ouvre : `http://localhost:4200/galerie`
2. Ouvre Console Dev (F12) → onglet "Console"
3. Tu devrais voir les logs de debug :
   ```
   Gallery Debug - First 5 images:
     T-Shirts — img (1).jpeg → /galery/img (1).jpeg
     T-Shirts — img (2).jpeg → /galery/img (2).jpeg
     ...
   ```
4. Vérifies l'onglet "Network" → cherche les requêtes `/galery/image.jpg`
   - Vert (200) = images trouvées ✅
   - Red (404) = images manquantes ❌

---

## Vérifications supplémentaires

### ✅ Le dossier `galery` existe et contient des images

```powershell
ls c:\wamp64\www\auradhom-v2\src\galery | wc -l
# Doit afficher : 41 (nombre d'images)
```

### ✅ La config `angular.json` est correcte

```powershell
# Vérifies la section "assets"
cd c:\wamp64\www\auradhom-v2
Get-Content angular.json | Select-String -Pattern '"glob": "\*\*/\*"' | Select-String -Pattern 'galery'
```

Doit retourner une ligne contenant `"input": "src/galery"`.

### ✅ Les images sont copiées après build

```powershell
# Vérifie que les images existent dans le build output
ls c:\wamp64\www\auradhom-v2\dist\demo\galery | wc -l
# Doit afficher : 41
```

---

## Encore un problème ?

### Les images restent blanches (chargement lent)

- Tes images sont grandes ? Elles prennent du temps à charger.
- Vérifies l'onglet Network (F12) → temps de chargement par image.
- Solution : optimise les images (réduis la taille ou la résolution).

### Erreur : "Cannot find module '@angular/...'"

```powershell
# Réinstalle les dépendances
npm install

# Puis redémarre
npm start
```

### Erreur dans la console du navigateur

```
GET /galery/image.jpg 404
```

C'est que `angular.json` n'a pas été appliqué. Refais l'Étape 1-2 ci-dessus.

---

## Vérification finale (Checklist)

- [ ] Serveur redémarré avec `npm start`
- [ ] Console dev affiche "Gallery Debug - First 5 images" avec chemins `/galery/...`
- [ ] Network tab : images en statut 200 (vert)
- [ ] Au moins 24 images visibles sur `/galerie`
- [ ] Filtres changent la grille (sélectionne "T-Shirts")
- [ ] Lightbox ouvre au click (appuie sur une image)

---

**Si tout fonctionne :** 🎉 Galerie OK ! Tu peux passer au design et aux optimisations.

**Si ça ne marche toujours pas :** Ouvre la console (F12) et partage les erreurs complètes.
