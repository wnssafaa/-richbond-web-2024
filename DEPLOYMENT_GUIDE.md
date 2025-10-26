# 🚀 Guide de Déploiement - Richbond Web App

## 📋 Prérequis
- ✅ Application Angular construite avec succès
- ✅ Compte GitHub (pour la plupart des options)
- ✅ Node.js installé (pour les commandes locales)

## 🎯 Options de Déploiement Gratuites

### 1. 🌟 **Vercel (Recommandé)**

**Avantages :**
- Déploiement automatique depuis GitHub
- CDN global ultra-rapide
- SSL automatique
- 100GB de bande passante/mois
- Support Angular natif

**Étapes :**
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Cliquez sur "New Project"
4. Sélectionnez votre repository Richbond
5. Vercel détectera automatiquement Angular
6. Cliquez sur "Deploy"
7. Votre site sera disponible à `https://votre-projet.vercel.app`

**Configuration automatique :**
- Build Command: `npm run build --prod`
- Output Directory: `dist/richbond`
- Install Command: `npm install`

---

### 2. 🌐 **Netlify**

**Avantages :**
- Déploiement continu depuis Git
- Formulaires statiques
- Fonctions serverless
- 100GB de bande passante/mois

**Étapes :**
1. Allez sur [netlify.com](https://netlify.com)
2. Connectez votre compte GitHub
3. Cliquez sur "New site from Git"
4. Sélectionnez votre repository Richbond
5. Configurez les paramètres :
   - Build command: `npm run build --prod`
   - Publish directory: `dist/richbond`
6. Cliquez sur "Deploy site"
7. Votre site sera disponible à `https://votre-projet.netlify.app`

---

### 3. 📄 **GitHub Pages**

**Avantages :**
- Intégration parfaite avec GitHub
- SSL automatique
- Illimité pour les repos publics

**Étapes :**
1. Allez dans les Settings de votre repository GitHub
2. Scrollez jusqu'à "Pages" dans le menu de gauche
3. Sous "Source", sélectionnez "GitHub Actions"
4. Créez un fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build --prod
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist/richbond
```

5. Commitez et poussez ce fichier
6. Votre site sera disponible à `https://username.github.io/repository-name`

---

### 4. 🔥 **Firebase Hosting**

**Avantages :**
- CDN global de Google
- SSL automatique
- 10GB de stockage
- 10GB de transfert/mois

**Étapes :**
1. Installez Firebase CLI : `npm install -g firebase-tools`
2. Connectez-vous : `firebase login`
3. Initialisez Firebase : `firebase init hosting`
4. Sélectionnez "dist/richbond" comme répertoire public
5. Configurez comme SPA (Single Page Application)
6. Déployez : `firebase deploy`
7. Votre site sera disponible à `https://votre-projet.web.app`

---

### 5. ⚡ **Surge.sh**

**Avantages :**
- Déploiement ultra-simple
- SSL automatique
- Illimité pour les projets personnels

**Étapes :**
1. Installez Surge : `npm install -g surge`
2. Naviguez vers le dossier build : `cd dist/richbond`
3. Déployez : `surge`
4. Suivez les instructions pour configurer le domaine
5. Votre site sera disponible à `https://votre-projet.surge.sh`

---

## 🔧 Configuration Backend

Votre application se connecte au backend à l'adresse :
```
http://68.183.71.119:8080
```

**Important :** Assurez-vous que votre backend est accessible depuis internet et que les CORS sont configurés pour accepter les requêtes depuis votre domaine de déploiement.

---

## 📱 Test de Déploiement

Après déploiement, testez ces fonctionnalités :
- ✅ Connexion utilisateur
- ✅ Navigation entre les pages
- ✅ Chargement des données depuis l'API
- ✅ Upload d'images
- ✅ Fonctionnalités de cartes (Leaflet)

---

## 🆘 Dépannage

### Problème : Erreur 404 sur les routes
**Solution :** Configurez les redirections SPA dans votre plateforme de déploiement.

### Problème : Erreur CORS
**Solution :** Configurez les CORS sur votre backend pour accepter votre domaine.

### Problème : Images ne se chargent pas
**Solution :** Vérifiez que les URLs d'images pointent vers le bon serveur backend.

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@richbond.com
- 💬 Discord : [Serveur Richbond](https://discord.gg/richbond)
- 📖 Documentation : [docs.richbond.com](https://docs.richbond.com)

---

## 🎉 Félicitations !

Votre application Richbond est maintenant déployée et accessible au monde entier ! 🌍
