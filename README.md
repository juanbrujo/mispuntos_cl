# Puntería

Convierte y compara programas de recompensas y fidelización en pesos chilenos.

## Stack

- **Framework**: [Nuxt 4](https://nuxt.com) + Vue 3 + TypeScript
- **Estilos**: Tailwind CSS v3 + shadcn-vue
- **Estado**: Pinia (stores)
- **Tests**: Vitest (coverage ≥85%)
- **Animaciones**: Lottie-web (loader.json)
- **Deploy**: Vercel (nitro preset `vercel`)

## Setup

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

Servidor en `http://localhost:3000`.

## Build

```bash
pnpm build
```

Genera output para Vercel en `.vercel/output/`.

## Tests

```bash
pnpm test              # ejecutar una vez
pnpm test:watch        # modo watch
pnpm test:coverage     # con reporte de cobertura
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | URL del sitio para compartir | `https://punteria.devschile.cl` |

## USD / CLP

El tipo de cambio se obtiene desde [dolarapi.com](https://cl.dolarapi.com/v1/cotizaciones/usd) al cargar la página. Los programas que dependen del dólar (LATAM Pass, SKY Plus) usan este valor en tiempo real.

## Programas

11 programas de fidelización incluidos: Pesos Chilenos, Cencosud, LATAM Pass, Lider Mi Club, CMR Puntos, Dólares Premio, Ripley Puntos, SKY Plus, Itaú Puntos, BciPlus+ y Full Copec.

Los datos están en `app/data/programs.ts`.
