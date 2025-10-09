# Script de test pour vérifier l'état des APIs Backend
# Exécuter dans PowerShell

Write-Host "🔍 Test des APIs Backend" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Test 1: API Produits
Write-Host "`n📦 Test API Produits..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/produits/all" -Method GET -TimeoutSec 5
    Write-Host "✅ API Produits: OK" -ForegroundColor Green
    Write-Host "   Nombre de produits: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API Produits: ERREUR" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 2: API Images (produit ID 1)
Write-Host "`n🖼️ Test API Images..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/produits/1/images" -Method GET -TimeoutSec 5
    Write-Host "✅ API Images: OK" -ForegroundColor Green
    Write-Host "   Image trouvée pour le produit 1" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️ API Images: 404 - Aucune image trouvée" -ForegroundColor Yellow
        Write-Host "   (Normal si le produit n'a pas d'image)" -ForegroundColor Gray
    } else {
        Write-Host "❌ API Images: ERREUR" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    }
}

# Test 3: Vérifier si le serveur répond
Write-Host "`n🌐 Test Connectivité Serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -TimeoutSec 5
    Write-Host "✅ Serveur Backend: Accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur Backend: Non accessible" -ForegroundColor Red
    Write-Host "   Vérifiez que le serveur Spring Boot est démarré" -ForegroundColor Gray
}

Write-Host "`n📋 Résumé:" -ForegroundColor Cyan
Write-Host "- Si l'API Produits fonctionne mais pas l'API Images: Normal (endpoint pas encore implémenté)" -ForegroundColor Gray
Write-Host "- Si aucune API ne fonctionne: Le backend n'est pas démarré" -ForegroundColor Gray
Write-Host "- Pour démarrer le backend: mvn spring-boot:run" -ForegroundColor Gray

