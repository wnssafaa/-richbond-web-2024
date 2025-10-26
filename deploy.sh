#!/bin/bash

# Script de déploiement automatique pour Richbond Web App

echo "🚀 Démarrage du déploiement de Richbond Web App..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Construire l'application
echo "🔨 Construction de l'application..."
npm run build --prod

# Vérifier que le build a réussi
if [ ! -d "dist/richbond" ]; then
    echo "❌ Erreur: Le build a échoué. Le dossier dist/richbond n'existe pas."
    exit 1
fi

echo "✅ Build réussi!"

# Afficher les options de déploiement
echo ""
echo "🎯 Options de déploiement disponibles:"
echo "1. Vercel (Recommandé)"
echo "2. Netlify"
echo "3. GitHub Pages"
echo "4. Firebase Hosting"
echo "5. Surge.sh"
echo ""

# Demander à l'utilisateur de choisir
read -p "Choisissez votre option de déploiement (1-5): " choice

case $choice in
    1)
        echo "🚀 Déploiement sur Vercel..."
        echo "1. Allez sur https://vercel.com"
        echo "2. Connectez votre compte GitHub"
        echo "3. Importez ce repository"
        echo "4. Vercel détectera automatiquement Angular et déploiera"
        ;;
    2)
        echo "🚀 Déploiement sur Netlify..."
        echo "1. Allez sur https://netlify.com"
        echo "2. Connectez votre compte GitHub"
        echo "3. Importez ce repository"
        echo "4. Build command: npm run build --prod"
        echo "5. Publish directory: dist/richbond"
        ;;
    3)
        echo "🚀 Déploiement sur GitHub Pages..."
        echo "1. Activez GitHub Pages dans les settings du repository"
        echo "2. Sélectionnez la branche main comme source"
        echo "3. Le site sera disponible à https://username.github.io/repository-name"
        ;;
    4)
        echo "🚀 Déploiement sur Firebase Hosting..."
        echo "1. Installez Firebase CLI: npm install -g firebase-tools"
        echo "2. Connectez-vous: firebase login"
        echo "3. Initialisez: firebase init hosting"
        echo "4. Déployez: firebase deploy"
        ;;
    5)
        echo "🚀 Déploiement sur Surge.sh..."
        echo "1. Installez Surge: npm install -g surge"
        echo "2. Déployez: surge dist/richbond"
        ;;
    *)
        echo "❌ Option invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Instructions de déploiement affichées!"
echo "📁 Votre application est prête dans le dossier: dist/richbond"
echo "🌐 URL du backend: http://68.183.71.119:8080"
echo ""
echo "🎉 Bon déploiement!"
