# Installation de jsPDF pour la génération de PDF

## Problème
Le bouton "Télécharger le PDF" ne fonctionne pas car la bibliothèque jsPDF n'est pas installée.

## Solution

### 1. Installer jsPDF

Exécutez la commande suivante dans le terminal (à la racine du projet) :

```bash
npm install jspdf
```

### 2. Si vous avez une erreur PowerShell

Si vous rencontrez une erreur PowerShell (exécution de scripts désactivée), vous pouvez :

**Option A : Activer l'exécution de scripts (temporairement)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Puis exécutez :
```bash
npm install jspdf
```

**Option B : Utiliser l'invite de commande (CMD)**
1. Ouvrez l'invite de commande (CMD) en tant qu'administrateur
2. Naviguez vers le dossier du projet : `cd C:\wamp64\www\auradhom-v2`
3. Exécutez : `npm install jspdf`

**Option C : Utiliser Git Bash ou un autre terminal**
Si vous avez Git installé, vous pouvez utiliser Git Bash pour exécuter la commande npm.

### 3. Redémarrer l'application

Après l'installation, redémarrez votre serveur de développement :

```bash
ng serve
```

ou

```bash
npm run dev
```

## Vérification

Une fois jsPDF installé, le bouton "Télécharger le PDF" devrait fonctionner correctement dans le tableau de bord admin pour les commandes validées.

## Note

La dépendance `jspdf` a déjà été ajoutée au fichier `package.json`. Il suffit d'exécuter `npm install` pour installer toutes les dépendances manquantes.

