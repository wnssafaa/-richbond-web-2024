# Script PowerShell pour tester les endpoints d'images de visites
# Utilisez ce script pour diagnostiquer rapidement les problèmes

Write-Host "🔍 Test des Endpoints d'Images de Visites" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:8080"
$visitId = 1  # Changez selon votre visite de test

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Base URL: $baseUrl" -ForegroundColor White
Write-Host "   Visit ID: $visitId" -ForegroundColor White

# Test 1: Vérifier que le backend est accessible
Write-Host "`n🧪 Test 1: Backend Accessible" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/visits" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Backend répond mais avec un code inattendu: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Vérifiez que le backend Spring Boot est démarré sur le port 8080" -ForegroundColor Cyan
    exit 1
}

# Test 2: Vérifier les visites disponibles
Write-Host "`n🧪 Test 2: Visites Disponibles" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/visits" -Method GET -TimeoutSec 10
    $visits = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ $($visits.Count) visite(s) trouvée(s)" -ForegroundColor Green
    
    if ($visits.Count -gt 0) {
        Write-Host "   📋 Premières visites:" -ForegroundColor Cyan
        $visits | Select-Object -First 3 | ForEach-Object {
            Write-Host "      - Visite ID: $($_.id), Statut: $($_.planning.statut)" -ForegroundColor White
        }
        
        # Utiliser le premier ID disponible si la visite spécifiée n'existe pas
        $availableVisit = $visits | Where-Object { $_.id -eq $visitId } | Select-Object -First 1
        if (-not $availableVisit) {
            $visitId = $visits[0].id
            Write-Host "   🔄 Utilisation de la visite ID: $visitId" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️ Aucune visite trouvée" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur lors de la récupération des visites: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier les images d'une visite
Write-Host "`n🧪 Test 3: Images de la Visite $visitId" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/visits/$visitId/images" -Method GET -TimeoutSec 10
    $images = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ $($images.Count) image(s) trouvée(s) pour la visite $visitId" -ForegroundColor Green
    
    if ($images.Count -gt 0) {
        Write-Host "   📸 Détails des images:" -ForegroundColor Cyan
        $images | ForEach-Object {
            Write-Host "      - Image ID: $($_.id), Fichier: $($_.originalFileName)" -ForegroundColor White
            Write-Host "        Taille: $($_.fileSize) bytes, Type: $($_.mimeType)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️ Aucune image trouvée pour cette visite" -ForegroundColor Yellow
        Write-Host "   💡 C'est normal si la visite n'a pas d'images" -ForegroundColor Cyan
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ⚠️ Aucune image trouvée (404) - Normal si pas d'images" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Erreur lors de la récupération des images: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Tester les URLs d'images individuelles
if ($images -and $images.Count -gt 0) {
    Write-Host "`n🧪 Test 4: URLs d'Images Individuelles" -ForegroundColor Yellow
    
    $firstImage = $images[0]
    $imageId = $firstImage.id
    
    # Test URL image complète
    $imageUrl = "$baseUrl/api/visits/$visitId/images/$imageId"
    Write-Host "   🔗 Test URL image complète: $imageUrl" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri $imageUrl -Method GET -TimeoutSec 10
        Write-Host "   ✅ Image complète accessible (Status: $($response.StatusCode), Taille: $($response.Content.Length) bytes)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Image complète non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test URL thumbnail
    $thumbnailUrl = "$baseUrl/api/visits/$visitId/images/$imageId/thumbnail"
    Write-Host "   🔗 Test URL thumbnail: $thumbnailUrl" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri $thumbnailUrl -Method GET -TimeoutSec 10
        Write-Host "   ✅ Thumbnail accessible (Status: $($response.StatusCode), Taille: $($response.Content.Length) bytes)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Thumbnail non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Vérifier les headers CORS
Write-Host "`n🧪 Test 5: Headers CORS" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/visits/$visitId/images" -Method OPTIONS -TimeoutSec 10
    $corsHeaders = @()
    if ($response.Headers['Access-Control-Allow-Origin']) { $corsHeaders += "Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" }
    if ($response.Headers['Access-Control-Allow-Methods']) { $corsHeaders += "Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" }
    if ($response.Headers['Access-Control-Allow-Headers']) { $corsHeaders += "Allow-Headers: $($response.Headers['Access-Control-Allow-Headers'])" }
    
    if ($corsHeaders.Count -gt 0) {
        Write-Host "   ✅ Headers CORS détectés:" -ForegroundColor Green
        $corsHeaders | ForEach-Object { Write-Host "      - $_" -ForegroundColor White }
    } else {
        Write-Host "   ⚠️ Aucun header CORS détecté" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez la configuration CORS du backend" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Erreur lors du test CORS: $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé et recommandations
Write-Host "`n📊 Résumé et Recommandations" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

Write-Host "`n💡 Actions recommandées:" -ForegroundColor Yellow
Write-Host "   1. Vérifiez que le backend Spring Boot est démarré" -ForegroundColor White
Write-Host "   2. Vérifiez que VisitImageController existe et fonctionne" -ForegroundColor White
Write-Host "   3. Vérifiez que les images sont stockées physiquement sur le serveur" -ForegroundColor White
Write-Host "   4. Vérifiez la configuration CORS dans le backend" -ForegroundColor White
Write-Host "   5. Testez les URLs d'images dans le navigateur" -ForegroundColor White

Write-Host "`n🔧 URLs à tester manuellement dans le navigateur:" -ForegroundColor Yellow
Write-Host "   - Visites: $baseUrl/api/visits" -ForegroundColor White
Write-Host "   - Images visite $visitId : $baseUrl/api/visits/$visitId/images" -ForegroundColor White
if ($images -and $images.Count -gt 0) {
    Write-Host "   - Image test: $baseUrl/api/visits/$visitId/images/$($images[0].id)" -ForegroundColor White
}

Write-Host "`n✨ Test terminé !" -ForegroundColor Green
