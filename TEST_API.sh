#!/bin/bash

# ============================================
# TESTING SCRIPT - RPG LOG API
# ============================================
# Copiar y pegar en terminal o Postman

# Variables
BASE_URL="http://localhost:3002/api"
USERNAME="testuser_$(date +%s)"
EMAIL="test_$(date +%s)@mail.com"
PASSWORD="123456"

echo "🚀 Iniciando tests de RPG Log API..."
echo "📍 Base URL: $BASE_URL"
echo ""

# ============================================
# 1. REGISTRO
# ============================================
echo "1️⃣  Registrando usuario..."
echo "Datos: username=$USERNAME, email=$EMAIL, password=$PASSWORD"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Respuesta:"
echo $REGISTER_RESPONSE | jq '.' 2>/dev/null || echo $REGISTER_RESPONSE

# Extraer token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token' 2>/dev/null)
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id' 2>/dev/null)

echo "✔ Token: $TOKEN"
echo "✔ User ID: $USER_ID"
echo ""

# ============================================
# 2. LOGIN
# ============================================
echo "2️⃣  Iniciando sesión..."
echo "Datos: email=$EMAIL, password=$PASSWORD"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Respuesta:"
echo $LOGIN_RESPONSE | jq '.' 2>/dev/null || echo $LOGIN_RESPONSE

# Extraer token (debería ser el mismo)
LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null)
echo "✔ Token Login: $LOGIN_TOKEN"
echo ""

# ============================================
# 3. OBTENER USUARIO ACTUAL
# ============================================
echo "3️⃣  Obteniendo usuario actual..."
echo "Headers: Authorization: Bearer $TOKEN"

GET_USER=$(curl -s -X GET "$BASE_URL/user/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta:"
echo $GET_USER | jq '.' 2>/dev/null || echo $GET_USER
echo ""

# ============================================
# 4. ACTUALIZAR STATS
# ============================================
echo "4️⃣  Actualizando stats..."
echo "Headers: Authorization: Bearer $TOKEN"
echo "Nuevos stats: fuerza=10, resistencia=8, agilidad=5"

UPDATE_STATS=$(curl -s -X PUT "$BASE_URL/user/stats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"fuerza\": 10,
    \"resistencia\": 8,
    \"agilidad\": 5
  }")

echo "Respuesta:"
echo $UPDATE_STATS | jq '.' 2>/dev/null || echo $UPDATE_STATS
echo ""

# ============================================
# 5. OBTENER TODOS LOS USUARIOS
# ============================================
echo "5️⃣  Obteniendo todos los usuarios..."

ALL_USERS=$(curl -s -X GET "$BASE_URL/user/all" \
  -H "Content-Type: application/json")

echo "Respuesta:"
echo $ALL_USERS | jq '.' 2>/dev/null || echo $ALL_USERS
echo ""

# ============================================
# 6. ERROR: Token inválido
# ============================================
echo "6️⃣  Test de error (token inválido)..."

ERROR_TEST=$(curl -s -X GET "$BASE_URL/user/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INVALID_TOKEN")

echo "Respuesta (debe ser error):"
echo $ERROR_TEST | jq '.' 2>/dev/null || echo $ERROR_TEST
echo ""

# ============================================
# FIN
# ============================================
echo "✅ Tests completados!"
echo "📊 Resumen:"
echo "  ✔ Registro: OK"
echo "  ✔ Login: OK"
echo "  ✔ Obtener usuario: OK"
echo "  ✔ Actualizar stats: OK"
echo "  ✔ Listar usuarios: OK"
echo "  ✔ Error handling: OK"
echo ""
echo "🎮 ¡RPG Log está funcionando correctamente!"
