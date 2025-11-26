# Scripts de prueba - Home Finance API

## 1. Crear Usuario

POST http://localhost:3000/auth/register
Content-Type: application/json

{
"name": "Damian Caglieris",
"email": "damiancaglieris@gmail.com",
"password": "16Narda02",
"role": "Admin"
}

---

## 2. Login

POST http://localhost:3000/auth/login
Content-Type: application/json

{
"email": "damiancaglieris@gmail.com",
"password": "16Narda02"
}

# Copiar el accessToken de la respuesta y usarlo en las siguientes requests

---

## 3. Crear Categoría Ingreso - Salario

POST http://localhost:3000/categories
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI

{
"name": "Salario",
"type": "Ingreso"
}

---

## 4. Crear Categoría Ingreso - Freelance

POST http://localhost:3000/categories
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI

{
"name": "Freelance",
"type": "Ingreso"
}

---

## 5. Crear Categoría Egreso - Supermercado

POST http://localhost:3000/categories
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI

{
"name": "Supermercado",
"type": "Egreso"
}

---

## 6. Crear Categoría Egreso - Transporte

POST http://localhost:3000/categories
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI

{
"name": "Transporte",
"type": "Egreso"
}

---

## 7. Crear Categoría Egreso - Servicios

POST http://localhost:3000/categories
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI

{
"name": "Servicios",
"type": "Egreso"
}

---

## 8. Listar todas las categorías

GET http://localhost:3000/categories
Authorization: Bearer TU_TOKEN_AQUI

---

## 9. Listar solo categorías de Ingreso

GET http://localhost:3000/categories?type=Ingreso
Authorization: Bearer TU_TOKEN_AQUI

---

## 10. Listar solo categorías de Egreso

GET http://localhost:3000/categories?type=Egreso
Authorization: Bearer TU_TOKEN_AQUI
