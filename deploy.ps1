# Script de déploiement PowerShell pour Richbond Web App

Write-Host "🚀 Démarrage du déploiement de Richbond Web App..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet." -ForegroundColor Red
    exit 1
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

# Construire l'application
Write-Host "🔨 Construction de l'application..." -ForegroundColor Yellow
npm run build --prod

# Vérifier que le build a réussi
if (-not (Test-Path "dist/richbond")) {
    Write-Host "❌ Erreur: Le build a échoué. Le dossier dist/richbond n'existe pas." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi!" -ForegroundColor Green

# Afficher les options de déploiement
Write-Host ""
Write-Host "🎯 Options de déploiement disponibles:" -ForegroundColor Cyan
Write-Host "1. Vercel (Recommandé)" -ForegroundColor White
Write-Host "2. Netlify" -ForegroundColor White
Write-Host "3. GitHub Pages" -ForegroundColor White
Write-Host "4. Firebase Hosting" -ForegroundColor White
Write-Host "5. Surge.sh" -ForegroundColor White
Write-Host ""

# Demander à l'utilisateur de choisir
$choice = Read-Host "Choisissez votre option de déploiement (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Déploiement sur Vercel..." -ForegroundColor Green
        Write-Host "1. Allez sur https://vercel.com" -ForegroundColor White
        Write-Host "2. Connectez votre compte GitHub" -ForegroundColor White
        Write-Host "3. Importez ce repository" -ForegroundColor White
        Write-Host "4. Vercel détectera automatiquement Angular et déploiera" -ForegroundColor White
    }
    "2" {
        Write-Host "🚀 Déploiement sur Netlify..." -ForegroundColor Green
        Write-Host "1. Allez sur https://netlify.com" -ForegroundColor White
        Write-Host "2. Connectez votre compte GitHub" -ForegroundColor White
        Write-Host "3. Importez ce repository" -ForegroundColor White
        Write-Host "4. Build command: npm run build --prod" -ForegroundColor White
        Write-Host "5. Publish directory: dist/richbond" -ForegroundColor White
    }
    "3" {
        Write-Host "🚀 Déploiement sur GitHub Pages..." -ForegroundColor Green
        Write-Host "1. Activez GitHub Pages dans les settings du repository" -ForegroundColor White
        Write-Host "2. Sélectionnez la branche main comme source" -ForegroundColor White
        Write-Host "3. Le site sera disponible à https://username.github.io/repository-name" -ForegroundColor White
    }
    "4" {
        Write-Host "🚀 Déploiement sur Firebase Hosting..." -ForegroundColor Green
        Write-Host "1. Installez Firebase CLI: npm install -g firebase-tools" -ForegroundColor White
        Write-Host "2. Connectez-vous: firebase login" -ForegroundColor White
        Write-Host "3. Initialisez: firebase init hosting" -ForegroundColor White
        Write-Host "4. Déployez: firebase deploy" -ForegroundColor White
    }
    "5" {
        Write-Host "🚀 Déploiement sur Surge.sh..." -ForegroundColor Green
        Write-Host "1. Installez Surge: npm install -g surge" -ForegroundColor White
        Write-Host "2. Déployez: surge dist/richbond" -ForegroundColor White
    }
    default {
        Write-Host "❌ Option invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Instructions de déploiement affichées!" -ForegroundColor Green
Write-Host "📁 Votre application est prête dans le dossier: dist/richbond" -ForegroundColor Cyan
Write-Host "🌐 URL du backend: http://68.183.71.119:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Bon déploiement!" -ForegroundColor Green
