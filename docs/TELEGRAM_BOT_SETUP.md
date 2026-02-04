# Bot de Telegram - Configuración

## Pasos para usar el bot:

### 1. Crear el bot en Telegram (Ya lo hiciste)

- Buscá @BotFather en Telegram
- Enviá `/newbot`
- Dale un nombre y username
- Copiá el TOKEN que te dio

### 2. Configurar el TOKEN en el backend

Abrí el archivo `backend/.env` y agregá estas líneas:

```
# Telegram Bot
TELEGRAM_BOT_TOKEN=TU_TOKEN_AQUI
API_URL=http://localhost:3000
```

Reemplazá `TU_TOKEN_AQUI` con el token que te dio BotFather.

### 3. Reiniciar el servidor

El servidor se reiniciará automáticamente con nodemon. Deberías ver:

```
✓ Telegram bot initialized
```

### 4. Vincular tu cuenta

1. Buscá tu bot en Telegram (el username que elegiste)
2. Enviá `/start`
3. Obtené tu USER_ID desde el frontend:
   - Andá a tu perfil en el sistema web
   - Copiá tu ID de usuario
4. En Telegram, enviá: `/vincular TU_USER_ID`
   - Ejemplo: `/vincular 1`

### 5. Empezar a usar el bot

Ahora podés enviar gastos directamente:

```
Supermercado 5000
Nafta 15000
Almuerzo 3500 USD
Ingreso sueldo 500000
```

El bot detectará automáticamente:

- ✓ Monto
- ✓ Moneda (ARS por defecto, o USD si lo especificás)
- ✓ Tipo (Egreso/Ingreso)
- ✓ Categoría sugerida

### 6. Procesar las transacciones

Las transacciones quedarán como "pendientes" y las podés procesar desde el sistema web en `/pending-transactions`

## Comandos disponibles:

- `/start` - Mensaje de bienvenida
- `/help` - Ayuda
- `/vincular USER_ID` - Vincular tu cuenta
- `/estado` - Ver estadísticas de transacciones pendientes

## Ejemplos de mensajes:

### Egresos (gastos):

- `Supermercado 5000`
- `Nafta Shell 15000`
- `Netflix 3500`
- `Almuerzo 8000 USD`

### Ingresos:

- `Ingreso sueldo 500000`
- `Cobro freelance 200 USD`
- `+Venta auto 1000000`

### Con moneda específica:

- `Compra ropa 50 USD`
- `Farmacia 12000 ARS`

El parser es inteligente y detecta:

- Keywords de ingreso: ingreso, cobro, cobré, cobre, ganancia, sueldo, salario, +
- Keywords de moneda: USD, U$S, dolar, dolares, dólar, dólares
- Categorías comunes: Supermercado, Transporte, Salud, Entretenimiento, Servicios, Comida, etc.
