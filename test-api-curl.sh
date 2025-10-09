#!/bin/bash

# Script de test de l'API Richbond avec curl
# Usage: ./test-api-curl.sh

echo "========================================="
echo "  Test API Richbond - Erreur 403"
echo "========================================="
echo ""

API_URL="http://localhost:8080/api/produits"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
show_result() {
    local title=$1
    local status=$2
    
    echo ""
    echo -e "${YELLOW}$title${NC}"
    echo "----------------------------------------"
    
    if [ $status -eq 200 ] || [ $status -eq 201 ]; then
        echo -e "${GREEN}✅ Status: $status${NC}"
    elif [ $status -eq 401 ] || [ $status -eq 403 ]; then
        echo -e "${RED}❌ Status: $status${NC}"
    else
        echo -e "${YELLOW}ℹ️  Status: $status${NC}"
    fi
}

# Test 1: Vérifier que le backend est accessible
echo -e "${CYAN}1️⃣  Test de connexion au backend...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/all")

if [ $response -eq 200 ]; then
    show_result "✅ Backend accessible" $response
    produits=$(curl -s "$API_URL/all" | jq '. | length' 2>/dev/null || echo "N/A")
    echo "Nombre de produits: $produits"
else
    show_result "❌ Backend non accessible" $response
    echo -e "${RED}Le backend n'est pas démarré ou n'écoute pas sur http://localhost:8080${NC}"
    echo -e "${YELLOW}Démarrez le backend et relancez ce script.${NC}"
    exit 1
fi

# Test 2: Tester l'ajout SANS token
echo ""
echo -e "${CYAN}2️⃣  Test d'ajout de produit SANS token...${NC}"

product_json='{
  "marque": "Sealy",
  "reference": "TEST-NO-TOKEN-'$(date +%Y%m%d%H%M%S)'",
  "categorie": "Matelas",
  "article": "Test Produit Sans Token",
  "type": "Standard",
  "dimensions": "140x190",
  "prix": 1999.99,
  "famille": "MATELAS",
  "sousMarques": "R VITAL",
  "codeEAN": "1234567890",
  "designationArticle": "Produit de test sans token",
  "disponible": true
}'

response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$API_URL/add" \
  -H "Content-Type: application/json" \
  -d "$product_json")

if [ $response -eq 200 ] || [ $response -eq 201 ]; then
    show_result "⚠️  Produit ajouté SANS token (problème de sécurité)" $response
    echo -e "${YELLOW}L'endpoint /api/produits/add est accessible sans authentification !${NC}"
elif [ $response -eq 401 ]; then
    show_result "✅ Requête refusée (comportement normal)" $response
    echo "L'endpoint est protégé. Authentification requise."
elif [ $response -eq 403 ]; then
    show_result "⚠️  Erreur 403 - CSRF ou permissions" $response
    echo -e "${RED}Le backend bloque la requête POST (probablement CSRF activé)${NC}"
    echo ""
    echo -e "${YELLOW}📋 Solutions possibles:${NC}"
    echo -e "${CYAN}   1. Désactivez CSRF dans SecurityConfig.java${NC}"
    echo -e "${CYAN}   2. Ajoutez @CrossOrigin sur le contrôleur${NC}"
    echo -e "${CYAN}   3. Configurez CORS correctement${NC}"
    echo ""
    echo -e "${GREEN}   Consultez le fichier BACKEND_FIX_403_ERROR.md pour les détails${NC}"
else
    show_result "❌ Erreur inattendue" $response
fi

# Test 3: Demander le token à l'utilisateur
echo ""
echo -e "${CYAN}3️⃣  Test d'ajout de produit AVEC token...${NC}"
echo -e "${YELLOW}Pour obtenir votre token JWT:${NC}"
echo -e "${CYAN}  1. Connectez-vous à l'application Angular (http://localhost:4200)${NC}"
echo -e "${CYAN}  2. Ouvrez la console du navigateur (F12)${NC}"
echo -e "${CYAN}  3. Tapez: localStorage.getItem('token')${NC}"
echo -e "${CYAN}  4. Copiez le token affiché${NC}"
echo ""

read -p "Collez votre token JWT ici (ou appuyez sur Entrée pour passer): " jwt_token

if [ ! -z "$jwt_token" ]; then
    product_with_token='{
      "marque": "Sealy",
      "reference": "TEST-WITH-TOKEN-'$(date +%Y%m%d%H%M%S)'",
      "categorie": "Matelas",
      "article": "Test Produit Avec Token",
      "type": "Standard",
      "dimensions": "140x190",
      "prix": 1999.99,
      "famille": "MATELAS",
      "sousMarques": "R VITAL",
      "codeEAN": "1234567891",
      "designationArticle": "Produit de test avec token",
      "disponible": true
    }'
    
    response=$(curl -s -o response.json -w "%{http_code}" \
      -X POST "$API_URL/add" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $jwt_token" \
      -d "$product_with_token")
    
    if [ $response -eq 200 ] || [ $response -eq 201 ]; then
        show_result "✅ Produit ajouté avec succès !" $response
        echo ""
        echo "Réponse du serveur:"
        cat response.json | jq '.' 2>/dev/null || cat response.json
        echo ""
        echo -e "${GREEN}🎉 LE PROBLÈME EST RÉSOLU !${NC}"
        echo -e "${GREEN}Le backend accepte maintenant les requêtes POST avec token.${NC}"
        rm -f response.json
    elif [ $response -eq 403 ]; then
        show_result "❌ Toujours erreur 403 AVEC token" $response
        echo -e "${RED}Le backend refuse la requête même avec un token valide${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Solutions à appliquer dans le backend:${NC}"
        echo ""
        echo -e "${CYAN}Dans SecurityConfig.java, ajoutez:${NC}"
        echo -e "${NC}.csrf(csrf -> csrf.disable())${NC}"
        echo ""
        echo -e "${CYAN}OU dans ProduitController.java, ajoutez sur la classe:${NC}"
        echo -e "${NC}@CrossOrigin(origins = \"http://localhost:4200\")${NC}"
        echo ""
        echo -e "${GREEN}📖 Voir BACKEND_FIX_403_ERROR.md pour plus de détails${NC}"
        rm -f response.json
    elif [ $response -eq 401 ]; then
        show_result "❌ Token invalide ou expiré" $response
        echo -e "${YELLOW}🔧 Solution:${NC}"
        echo -e "${CYAN}   Reconnectez-vous à l'application Angular pour obtenir un nouveau token${NC}"
        rm -f response.json
    else
        show_result "❌ Erreur inattendue" $response
        echo "Réponse:"
        cat response.json 2>/dev/null
        rm -f response.json
    fi
else
    echo -e "${YELLOW}Test ignoré (aucun token fourni)${NC}"
fi

# Test 4: Test CORS
echo ""
echo -e "${CYAN}4️⃣  Test CORS (requête preflight)...${NC}"

response=$(curl -s -o cors_response.txt -w "%{http_code}" \
  -X OPTIONS "$API_URL/add" \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  -v 2>&1)

if grep -q "Access-Control-Allow-Origin.*localhost:4200" cors_response.txt; then
    echo -e "${GREEN}✅ CORS configuré correctement${NC}"
    echo "Le backend autorise les requêtes depuis http://localhost:4200"
else
    echo -e "${RED}❌ Problème de configuration CORS${NC}"
    echo -e "${YELLOW}Le backend ne retourne pas les headers CORS appropriés${NC}"
    echo ""
    echo -e "${YELLOW}📋 Solution:${NC}"
    echo -e "${CYAN}Configurez CORS dans SecurityConfig.java (voir BACKEND_FIX_403_ERROR.md)${NC}"
fi
rm -f cors_response.txt

# Test 5: Vérifier les endpoints disponibles
echo ""
echo -e "${CYAN}5️⃣  Vérification des endpoints disponibles...${NC}"

endpoints=(
    "GET $API_URL/all"
    "GET $API_URL/1"
)

for endpoint in "${endpoints[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    url=$(echo $endpoint | cut -d' ' -f2)
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url")
    
    if [ $response -eq 200 ] || [ $response -eq 201 ]; then
        echo -e "${GREEN}✅ $method $url - Status: $response${NC}"
    else
        echo -e "${RED}❌ $method $url - Status: $response${NC}"
    fi
done

# Résumé
echo ""
echo "========================================="
echo "              RÉSUMÉ"
echo "========================================="
echo ""
echo -e "${YELLOW}📌 Actions à faire dans le backend:${NC}"
echo ""
echo -e "${NC}1. Ouvrez le projet backend (rechbonf-bakend-main)${NC}"
echo ""
echo -e "${NC}2. Modifiez SecurityConfig.java:${NC}"
echo -e "${CYAN}   - Ajoutez .csrf(csrf -> csrf.disable())${NC}"
echo -e "${CYAN}   - Vérifiez la configuration CORS${NC}"
echo ""
echo -e "${NC}3. Dans ProduitController.java, ajoutez:${NC}"
echo -e "${CYAN}   @CrossOrigin(origins = \"http://localhost:4200\")${NC}"
echo -e "${CYAN}   sur la classe ou sur la méthode @PostMapping(\"/add\")${NC}"
echo ""
echo -e "${NC}4. Redémarrez le backend:${NC}"
echo -e "${CYAN}   mvn clean spring-boot:run${NC}"
echo ""
echo -e "${NC}5. Relancez ce script pour vérifier${NC}"
echo ""
echo -e "${GREEN}📖 Consultez BACKEND_FIX_403_ERROR.md pour plus de détails${NC}"
echo ""

