# Mamá, papá, tengo que contarte algo — GitHub + Netlify + Mercado Pago

Proyecto listo para subir a GitHub y desplegar con Netlify.

## Estructura

```text
public/
  index.html              Landing principal
  gracias.html            Acceso después de pago aprobado
  pago-pendiente.html     Estado pendiente
  pago-error.html         Pago rechazado/cancelado
netlify/functions/
  create-preference.js    Crea Checkout Pro en Mercado Pago
  verify-payment.js       Verifica el pago antes de mostrar Drive
  public-config.js        Precio, deadline y cupos públicos
  live-viewers.js         Personas activas reales (Netlify Blobs)
netlify.toml
package.json
.env.example
.gitignore
```

## 1) Subir a GitHub

Sube toda esta carpeta al repositorio. **No subas un archivo `.env` con credenciales reales.**

## 2) Conectar el repositorio a Netlify

1. En Netlify crea un proyecto nuevo desde Git.
2. Selecciona el repositorio.
3. `netlify.toml` ya define:
   - publish: `public`
   - functions: `netlify/functions`
4. No necesitas un comando de build para este sitio estático.

## 3) Variables de entorno en Netlify

En **Project configuration → Environment variables**, crea:

- `MERCADOPAGO_ACCESS_TOKEN` → Access Token de Mercado Pago. **Nunca ponerlo en GitHub.**
- `DRIVE_FOLDER_URL` → URL de la carpeta de Google Drive con los PDFs. Mantenerla fuera del repositorio.
- `OFFER_ENDS_AT` → cierre real de la promoción en ISO 8601, por ejemplo `2026-09-05T23:59:59-03:00`.
- `LAUNCH_PRICE_ARS` → `9999`
- `REGULAR_PRICE_ARS` → `14999`
- `CUPOS_TOTALES` → `20`
- `CUPOS_TOMADOS` → `8`
- `SITE_URL` → opcional. Solo si quieres forzar un dominio distinto al `URL` principal de Netlify.

Después de cambiar variables, vuelve a desplegar para que todo quede consistente.

## 4) Google Drive

La carpeta debe permitir que un comprador con el enlace pueda ver/descargar los PDFs. El enlace **no aparece en el HTML público**: `verify-payment.js` lo devuelve únicamente después de verificar un pago aprobado con Mercado Pago.

Esto reduce el acceso directo casual, aunque Google Drive no es un sistema DRM: un comprador puede compartir el enlace una vez que lo recibió.

## 5) Mercado Pago

`create-preference.js` crea una preferencia por intento de compra y usa estas URLs:

- aprobado → `/gracias.html`
- pendiente → `/pago-pendiente.html`
- rechazado/cancelado → `/pago-error.html`

La página de gracias **no confía solo en el parámetro `status` del navegador**. Consulta `verify-payment.js`, que verifica el `payment_id` contra la API de Mercado Pago y solo entonces entrega el link de Drive.

## 6) Personas viendo la página

`live-viewers.js` usa Netlify Blobs para contar sesiones activas de verdad. El navegador envía un heartbeat cada 20 segundos y se consideran activas las sesiones vistas en los últimos ~70 segundos.

Para revisar el diseño con números simulados puedes abrir:

`/?preview=1`

Ese modo es solo visual. En producción, sin `preview=1`, se utiliza el conteo real.

## 7) Cupos

Los cupos se leen desde las variables `CUPOS_TOTALES` y `CUPOS_TOMADOS`. Si muestras “8 de 20 cupos tomados”, mantenlo sincronizado con una limitación real de la promoción.

## 8) Prueba antes de publicar

1. Usa credenciales de prueba de Mercado Pago.
2. Realiza una compra de prueba.
3. Comprueba que Mercado Pago redirige a `gracias.html`.
4. Verifica que el botón a Drive solo aparece cuando el pago está aprobado.
5. Cambia al Access Token de producción cuando todo funcione.

## Soporte visible en la web

`desdeecorazondecasa@gmail.com`
