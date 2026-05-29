# Reglas del Agente

## Stack
- Nuxt 4 + Vue 3 + TypeScript
- Tailwind CSS v3 + shadcn-vue
- Pinia (stores)
- Vitest (tests + coverage)

## Prefijos / Comandos
- Usa **`rtk`** para todos los comandos (grep, list, dev, build, test, etc.)

## Documentación
- Siempre usa **Context7** (`resolve-library-id` + `get-library-docs`) para consultar documentación actualizada de librerías.

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
