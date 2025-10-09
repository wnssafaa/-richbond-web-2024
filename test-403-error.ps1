# Script de diagnostic pour l'erreur 403 lors de l'ajout de produits
# Usage: .\test-403-error.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Erreur 403 - Ajout de Produit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://localhost:8080/api/produits"

# Fonction pour afficher les résultats
function Show-Result {
    param (
        [string]$Title,
        [int]$StatusCode,
        [string]$Response,
        [string]$Error
    )
    
    Write-Host "`n$Title" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    if ($StatusCode -eq 200 -or $StatusCode -eq 201) {
        Write-Host "Status: $StatusCode ✅" -ForegroundColor Green
    } elseif ($StatusCode -eq 401 -or $StatusCode -eq 403) {
        Write-Host "Status: $StatusCode ⚠️" -ForegroundColor Red
    } else {
        Write-Host "Status: $StatusCode ℹ️" -ForegroundColor Yellow
    }
    
    if ($Response) {
        Write-Host "Réponse:" -ForegroundColor Cyan
        Write-Host $Response -ForegroundColor Gray
    }
    
    if ($Error) {
        Write-Host "Erreur:" -ForegroundColor Red
        Write-Host $Error -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Test 1: Vérifier que le backend est accessible
Write-Host "`n1️⃣  Test de connexion au backend..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/all" -Method GET -UseBasicParsing
    $produits = $response.Content | ConvertFrom-Json
    Show-Result -Title "✅ Backend accessible" -StatusCode $response.StatusCode -Response "Nombre de produits: $($produits.Length)"
} catch {
    Show-Result -Title "❌ Backend non accessible" -StatusCode 0 -Error $_.Exception.Message
    Write-Host "❌ Le backend n'est pas démarré ou n'écoute pas sur http://localhost:8080" -ForegroundColor Red
    Write-Host "   Démarrez le backend et relancez ce script." -ForegroundColor Yellow
    exit
}

# Test 2: Tester l'ajout SANS token
Write-Host "`n2️⃣  Test d'ajout de produit SANS token..." -ForegroundColor Magenta
$testProduct = @{
    marque = "Sealy"
    reference = "TEST-NO-TOKEN-$(Get-Date -Format 'yyyyMMddHHmmss')"
    categorie = "Matelas"
    article = "Test Produit Sans Token"
    type = "Standard"
    dimensions = "140x190"
    prix = 1999.99
    famille = "MATELAS"
    sousMarques = "R VITAL"
    codeEAN = "1234567890"
    designationArticle = "Produit de test sans token"
    disponible = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$apiUrl/add" -Method POST -Body $testProduct -ContentType "application/json" -UseBasicParsing
    Show-Result -Title "⚠️ Produit ajouté SANS token (problème de sécurité)" -StatusCode $response.StatusCode -Response "L'endpoint /api/produits/add est accessible sans authentification !"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Show-Result -Title "✅ Requête refusée (comportement normal)" -StatusCode $statusCode -Response "L'endpoint est protégé. Authentification requise."
    } elseif ($statusCode -eq 403) {
        Show-Result -Title "⚠️ Erreur 403 - CSRF ou permissions" -StatusCode $statusCode -Error "Le backend bloque la requête POST (probablement CSRF activé)"
        Write-Host "📋 Solutions possibles:" -ForegroundColor Yellow
        Write-Host "   1. Désactivez CSRF dans SecurityConfig.java" -ForegroundColor Cyan
        Write-Host "   2. Ajoutez @CrossOrigin sur le contrôleur" -ForegroundColor Cyan
        Write-Host "   3. Configurez CORS correctement" -ForegroundColor Cyan
        Write-Host "`n   Consultez le fichier BACKEND_FIX_403_ERROR.md pour les détails" -ForegroundColor Green
    } else {
        Show-Result -Title "❌ Erreur inattendue" -StatusCode $statusCode -Error $_.Exception.Message
    }
}

# Test 3: Tester l'ajout AVEC un token (demander le token à l'utilisateur)
Write-Host "`n3️⃣  Test d'ajout de produit AVEC token..." -ForegroundColor Magenta
Write-Host "Pour obtenir votre token JWT:" -ForegroundColor Yellow
Write-Host "  1. Connectez-vous à l'application Angular (http://localhost:4200)" -ForegroundColor Cyan
Write-Host "  2. Ouvrez la console du navigateur (F12)" -ForegroundColor Cyan
Write-Host "  3. Tapez: localStorage.getItem('token')" -ForegroundColor Cyan
Write-Host "  4. Copiez le token affiché" -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "Collez votre token JWT ici (ou appuyez sur Entrée pour passer)"

if ($token -and $token.Trim() -ne "") {
    $testProduct2 = @{
        marque = "Sealy"
        reference = "TEST-WITH-TOKEN-$(Get-Date -Format 'yyyyMMddHHmmss')"
        categorie = "Matelas"
        article = "Test Produit Avec Token"
        type = "Standard"
        dimensions = "140x190"
        prix = 1999.99
        famille = "MATELAS"
        sousMarques = "R VITAL"
        codeEAN = "1234567891"
        designationArticle = "Produit de test avec token"
        disponible = $true
    } | ConvertTo-Json

    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-WebRequest -Uri "$apiUrl/add" -Method POST -Body $testProduct2 -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        Show-Result -Title "✅ Produit ajouté avec succès !" -StatusCode $response.StatusCode -Response ($data | ConvertTo-Json -Depth 3)
        Write-Host "🎉 LE PROBLÈME EST RÉSOLU !" -ForegroundColor Green
        Write-Host "   Le backend accepte maintenant les requêtes POST avec token." -ForegroundColor Green
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 403) {
            Show-Result -Title "❌ Toujours erreur 403 AVEC token" -StatusCode $statusCode -Error "Le backend refuse la requête même avec un token valide"
            Write-Host "🔧 Solutions à appliquer dans le backend:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Dans SecurityConfig.java, ajoutez:" -ForegroundColor Cyan
            Write-Host ".csrf(csrf -> csrf.disable())" -ForegroundColor White
            Write-Host ""
            Write-Host "OU dans ProduitController.java, ajoutez sur la classe:" -ForegroundColor Cyan
            Write-Host "@CrossOrigin(origins = `"http://localhost:4200`")" -ForegroundColor White
            Write-Host ""
            Write-Host "📖 Voir BACKEND_FIX_403_ERROR.md pour plus de détails" -ForegroundColor Green
            
        } elseif ($statusCode -eq 401) {
            Show-Result -Title "❌ Token invalide ou expiré" -StatusCode $statusCode -Error "Le token fourni n'est pas valide"
            Write-Host "🔧 Solution:" -ForegroundColor Yellow
            Write-Host "   Reconnectez-vous à l'application Angular pour obtenir un nouveau token" -ForegroundColor Cyan
            
        } else {
            Show-Result -Title "❌ Erreur inattendue" -StatusCode $statusCode -Error $_.Exception.Message
        }
    }
} else {
    Write-Host "Test ignoré (aucun token fourni)" -ForegroundColor Gray
}

# Test 4: Vérifier les endpoints disponibles
Write-Host "`n4️⃣  Vérification des endpoints disponibles..." -ForegroundColor Magenta
try {
    # Test de l'endpoint /all
    $getAllResponse = Invoke-WebRequest -Uri "$apiUrl/all" -Method GET -UseBasicParsing
    Write-Host "✅ GET /api/produits/all - Status: $($getAllResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/produits/all - Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "              RÉSUMÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📌 Actions à faire dans le backend:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ouvrez le projet backend (rechbonf-bakend-main)" -ForegroundColor White
Write-Host ""
Write-Host "2. Modifiez SecurityConfig.java:" -ForegroundColor White
Write-Host "   - Ajoutez .csrf(csrf -> csrf.disable())" -ForegroundColor Cyan
Write-Host "   - Vérifiez la configuration CORS" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Dans ProduitController.java, ajoutez:" -ForegroundColor White
Write-Host "   @CrossOrigin(origins = `"http://localhost:4200`")" -ForegroundColor Cyan
Write-Host "   sur la classe ou sur la méthode @PostMapping(`"/add`")" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Redémarrez le backend:" -ForegroundColor White
Write-Host "   mvn clean spring-boot:run" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Relancez ce script pour vérifier" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consultez BACKEND_FIX_403_ERROR.md pour plus de détails" -ForegroundColor Green
Write-Host ""

