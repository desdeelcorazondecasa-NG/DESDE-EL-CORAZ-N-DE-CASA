# Desde el Corazón de Casa — Netlify

Esta versión está preparada para la estructura ACTUAL del repositorio: los archivos HTML viven en la raíz.

## Estructura esperada

- index.html
- gracias.html
- pago-pendiente.html
- pago-error.html
- netlify.toml
- package.json
- netlify/functions/create-preference.js
- netlify/functions/public-config.js
- netlify/functions/live-viewers.js

## Netlify

`netlify.toml` usa:

- Publish directory: `.`
- Functions directory: `netlify/functions`
- Build command: ninguno

## Variables de entorno necesarias

- `MERCADOPAGO_ACCESS_TOKEN`
- `OFFER_ENDS_AT`
- `LAUNCH_PRICE_ARS=9999`
- `REGULAR_PRICE_ARS=14999`
- `CUPOS_TOTALES=20`
- `CUPOS_TOMADOS=8`
- `SITE_URL` (opcional; si no se define Netlify usa su URL del sitio)

No subas el Access Token a GitHub.
