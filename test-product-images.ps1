# Script de test pour vérifier l'affichage des images de produits
# Exécuter dans PowerShell

Write-Host "🖼️ Test des Images de Produits" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Test 1: Vérifier l'API Produits avec images
Write-Host "`n📦 Test API Produits avec images..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/produits/all" -Method GET -TimeoutSec 10
    Write-Host "✅ API Produits: OK" -ForegroundColor Green
    Write-Host "   Nombre de produits: $($response.Count)" -ForegroundColor Gray
    
    # Vérifier si les produits ont des images
    $produitsAvecImages = $response | Where-Object { $_.imageData -ne $null }
    Write-Host "   Produits avec images: $($produitsAvecImages.Count)" -ForegroundColor Gray
    
    if ($produitsAvecImages.Count -gt 0) {
        $premierProduit = $produitsAvecImages[0]
        Write-Host "   Premier produit avec image:" -ForegroundColor Gray
        Write-Host "     - ID: $($premierProduit.id)" -ForegroundColor Gray
        Write-Host "     - Article: $($premierProduit.article)" -ForegroundColor Gray
        Write-Host "     - Image ID: $($premierProduit.imageData.id)" -ForegroundColor Gray
        Write-Host "     - Nom fichier: $($premierProduit.imageData.originalFileName)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ API Produits: ERREUR" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 2: Vérifier l'accès direct aux images
Write-Host "`n🖼️ Test accès direct aux images..." -ForegroundColor Yellow
if ($produitsAvecImages -and $produitsAvecImages.Count -gt 0) {
    $produit = $produitsAvecImages[0]
    $imageUrl = "http://localhost:8080/api/produits/$($produit.id)/images/$($produit.imageData.id)"
    
    try {
        $imageResponse = Invoke-WebRequest -Uri $imageUrl -Method GET -TimeoutSec 10
        Write-Host "✅ Image accessible: OK" -ForegroundColor Green
        Write-Host "   URL: $imageUrl" -ForegroundColor Gray
        Write-Host "   Taille: $($imageResponse.Headers.'Content-Length') bytes" -ForegroundColor Gray
        Write-Host "   Type: $($imageResponse.Headers.'Content-Type')" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Image non accessible: ERREUR" -ForegroundColor Red
        Write-Host "   URL: $imageUrl" -ForegroundColor Gray
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️ Aucun produit avec image trouvé pour le test" -ForegroundColor Yellow
}

# Test 3: Vérifier les thumbnails
Write-Host "`n🖼️ Test des thumbnails..." -ForegroundColor Yellow
if ($produitsAvecImages -and $produitsAvecImages.Count -gt 0) {
    $produit = $produitsAvecImages[0]
    $thumbnailUrl = "http://localhost:8080/api/produits/$($produit.id)/images/$($produit.imageData.id)/thumbnail"
    
    try {
        $thumbnailResponse = Invoke-WebRequest -Uri $thumbnailUrl -Method GET -TimeoutSec 10
        Write-Host "✅ Thumbnail accessible: OK" -ForegroundColor Green
        Write-Host "   URL: $thumbnailUrl" -ForegroundColor Gray
        Write-Host "   Taille: $($thumbnailResponse.Headers.'Content-Length') bytes" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Thumbnail non accessible: ERREUR" -ForegroundColor Red
        Write-Host "   URL: $thumbnailUrl" -ForegroundColor Gray
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️ Aucun produit avec image trouvé pour le test" -ForegroundColor Yellow
}

Write-Host "`n📋 Résumé:" -ForegroundColor Cyan
Write-Host "- Si l'API Produits retourne des imageData: Les images devraient s'afficher" -ForegroundColor Gray
Write-Host "- Si les URLs d'images sont accessibles: Le frontend peut les charger" -ForegroundColor Gray
Write-Host "- Si les thumbnails sont accessibles: Affichage optimisé" -ForegroundColor Gray
Write-Host "- Vérifiez la console du navigateur pour les logs de debug" -ForegroundColor Gray
