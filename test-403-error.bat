@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo =========================================
echo   Test Erreur 403 - Ajout de Produit
echo =========================================
echo.

set API_URL=http://localhost:8080/api/produits

:: Test 1: Vérifier que le backend est accessible
echo 1️⃣  Test de connexion au backend...
echo ─────────────────────────────────────────
curl -s -o nul -w "Status: %%{http_code}" "%API_URL%/all"
echo.
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Le backend n'est pas accessible
    echo    Vérifiez que le backend est démarré sur http://localhost:8080
    echo.
    pause
    exit /b 1
)

echo ✅ Backend accessible
echo.

:: Test 2: Tester l'ajout SANS token
echo.
echo 2️⃣  Test d'ajout de produit SANS token...
echo ─────────────────────────────────────────

set "product_json={\"marque\":\"Sealy\",\"reference\":\"TEST-NO-TOKEN\",\"categorie\":\"Matelas\",\"article\":\"Test\",\"type\":\"Standard\",\"dimensions\":\"140x190\",\"prix\":1999,\"famille\":\"MATELAS\",\"sousMarques\":\"R VITAL\",\"codeEAN\":\"123\",\"designationArticle\":\"Test\",\"disponible\":true}"

curl -s -o test_result.txt -w "Status: %%{http_code}" -X POST "%API_URL%/add" -H "Content-Type: application/json" -d "%product_json%"
echo.

for /f "tokens=2" %%i in ('curl -s -o nul -w "%%{http_code}" -X POST "%API_URL%/add" -H "Content-Type: application/json" -d "%product_json%"') do set status=%%i

if "%status%"=="403" (
    echo ❌ Erreur 403 - CSRF activé
    echo.
    echo 📋 Solutions:
    echo    1. Dans SecurityConfig.java, ajoutez: .csrf^(csrf -^> csrf.disable^(^)^)
    echo    2. Dans ProduitController.java, ajoutez: @CrossOrigin
    echo.
    echo 📖 Voir BACKEND_FIX_403_ERROR.md pour plus de détails
    echo.
) else if "%status%"=="401" (
    echo ✅ Endpoint protégé ^(normal^)
    echo    Status: %status% - Authentification requise
    echo.
) else if "%status%"=="201" (
    echo ⚠️  Endpoint accessible sans token ^(problème de sécurité^)
    echo.
) else (
    echo ℹ️  Status: %status%
    echo.
)

del test_result.txt 2>nul

:: Test 3: Instructions pour tester avec token
echo.
echo 3️⃣  Test d'ajout de produit AVEC token...
echo ─────────────────────────────────────────
echo.
echo Pour obtenir votre token JWT:
echo   1. Ouvrez http://localhost:4200
echo   2. Connectez-vous
echo   3. Ouvrez la console du navigateur ^(F12^)
echo   4. Tapez: localStorage.getItem^('token'^)
echo   5. Copiez le token affiché
echo.
echo Ensuite, utilisez ce token pour tester:
echo.
echo curl -X POST http://localhost:8080/api/produits/add \
echo   -H "Content-Type: application/json" \
echo   -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
echo   -d "{\"marque\":\"Sealy\",...}"
echo.

:: Résumé
echo.
echo =========================================
echo              RÉSUMÉ
echo =========================================
echo.
echo 📌 Actions à faire dans le backend:
echo.
echo 1. Ouvrez le projet backend dans IntelliJ IDEA
echo.
echo 2. Modifiez src\main\java\com\example\Richbondbakend\config\SecurityConfig.java
echo    Ajoutez: .csrf^(csrf -^> csrf.disable^(^)^)
echo.
echo 3. OU ajoutez dans ProduitController.java:
echo    @CrossOrigin^(origins = "http://localhost:4200"^)
echo.
echo 4. Redémarrez le backend
echo    mvn clean spring-boot:run
echo.
echo 5. Testez de nouveau l'ajout de produit
echo.
echo 📖 Consultez README_FIX_403.md pour le guide complet
echo.
echo ═══════════════════════════════════════════
echo   Outils de test disponibles:
echo ═══════════════════════════════════════════
echo.
echo   📄 TEST_403_ERROR.html         - Test dans le navigateur
echo   📄 test-403-error.ps1          - Script PowerShell
echo   📄 test-api-curl.sh            - Script bash/curl
echo.

pause

