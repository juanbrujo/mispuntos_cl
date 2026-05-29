# Reglas del Agente

## Stack
- Nuxt 4 + Vue 3 + TypeScript
- Tailwind CSS v3 + shadcn-vue
- Pinia (stores)
- Vitest (tests + coverage)

## Prefijos / Comandos
- Usa **`rtk`** para todos los comandos bash (grep, list, pnpm, etc.)

## Documentación
- Siempre usa **Context7** (`resolve-library-id` + `get-library-docs`) para consultar documentación actualizada de librerías.

## TypeScript
- Todo el código debe ser **TypeScript** estricto.
- Archivos `.ts` para lógica, utilidades, stores, tests y configuraciones.
- Archivos `.vue` con `<script setup lang="ts">` para componentes.
- **No usar JavaScript** (`.js`, `.mjs`, `.cjs`, `.jsx`) en ningún archivo del proyecto.
- Definir tipos explícitos en props, stores, composables y funciones.
- Evitar `any` — preferir tipos genéricos, interfaces o `unknown` cuando sea necesario.

## Componentes
- Todos los componentes deben ser **reutilizables**.
- Deben recibir datos vía **props** (nada de lógica hardcodeada).
- Cada componente debe tener su **test unitario** correspondiente.

## Tests
- Cobertura mínima: **85%** (líneas, branches, functions, statements).
- Ejecutar `pnpm test:coverage` para verificar cobertura antes de finalizar.

## Commits / Push
- Antes de cada push se ejecutan los tests automáticamente (pre-push hook de Husky).
- Si los tests fallan, el push se rechaza.
