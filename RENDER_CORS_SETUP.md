# Configuración CORS para Render

## URLs en Render:

- **Backend**: https://home-finance-backend.onrender.com
- **Frontend**: https://chatuc-homefinance.onrender.com

---

## 🔧 PASO 1: Configurar el BACKEND en Render

1. Ve a tu dashboard de Render
2. Selecciona tu servicio **home-finance-backend**
3. Haz clic en **Settings** → **Environment**
4. Agrega o actualiza estas variables:

```
FRONTEND_URL=https://chatuc-homefinance.onrender.com
RENDER_EXTERNAL_URL=https://home-finance-backend.onrender.com
NODE_ENV=production
```

5. **Deploy** para aplicar los cambios

---

## 🔧 PASO 2: Configurar el FRONTEND en Render

1. Ve a tu dashboard de Render
2. Selecciona tu servicio **chatuc-homefinance**
3. Haz clic en **Settings** → **Environment**
4. Agrega o actualiza esta variable:

```
NEXT_PUBLIC_API_URL=https://home-finance-backend.onrender.com
```

5. **Deploy** para aplicar los cambios

---

## ✅ PASO 3: Verificar que funciona

Después de hacer deploy:

1. Ve a https://chatuc-homefinance.onrender.com
2. Intenta hacer login
3. Abre las **DevTools** (F12) → **Network** o **Console**
4. Si ves que las requests van a `https://home-finance-backend.onrender.com` ✅ está correcto

---

## 🐛 Si aún tienes errores CORS:

- Asegúrate que el backend está corriendo (visita https://home-finance-backend.onrender.com/health)
- Los cambios en Environment pueden tardar 1-2 minutos en aplicarse
- Intenta hacer un **Hard Refresh** (Ctrl+Shift+R o Cmd+Shift+R)
- Si persiste, revisa los logs del backend en Render

---

## 📝 Para desarrollo LOCAL:

Usa el archivo `.env` en la raíz del proyecto con las variables de `localhost`.
