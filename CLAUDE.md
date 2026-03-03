# ecommerce-frontend

Angular 20 monorepo for a multi-vendor ecommerce platform. Three standalone apps share a set of library projects.

## Commands

```bash
ng serve                  # dev server for store (default)
ng serve --project vendor # dev server for vendor portal
ng serve --project admin  # dev server for admin dashboard
ng build                  # production build (store)
ng test                   # run tests (store)
```

## Project Structure

```
projects/
  store/    – customer-facing storefront app
  vendor/   – vendor portal app
  admin/    – admin dashboard app
  core/     – services library (ProductService, etc.)
  ui/       – shared UI component library (ProductCard, Button, etc.)
  models/   – TypeScript interfaces (Product, etc.)
  services/ – additional injectable services
  guards/   – route guard library
  shared/   – shared utilities
```

## Path Aliases (tsconfig.json)

| Alias | Resolves to |
|-------|-------------|
| `@ui` | `projects/ui/src/public-api.ts` |
| `@ui/*` | `projects/ui/src/lib/*` |
| `@core/*` | `projects/core/src/lib/*` |
| `@models/*` | `projects/models/src/lib/*` |
| `@services/*` | `projects/services/src/lib/*` |
| `@guards/*` | `projects/guards/src/lib/*` |
| `@shared/*` | `projects/shared/src/lib/*` |

## Architecture

- **Angular 20**, TypeScript 5.9, strict mode enabled
- **All components are standalone** – no NgModule declarations anywhere
- **Angular Material** for icon/button primitives; **Tailwind CSS 3** for layout/utility classes
- **SCSS** as the component style language
- Component selector prefix: `app-*` for apps, `lib-*` for libraries

## Critical Rules for Importing UI Components

### Always import directly via `@ui/*`, never through the `@ui` barrel

Angular 20's static evaluator cannot follow multi-step barrel re-export chains when library files live outside the consuming app's `src/` directory. Importing through the `@ui` barrel alias causes NG991010.

```ts
// CORRECT — direct path, Angular can statically verify @Component decorator
import { ProductCard } from '@ui/components/product-card/product-card';

// WRONG — barrel chain breaks Angular's static analysis → NG991010
import { ProductCard } from '@ui';
```

### Named exports in public-api.ts

Always use **named exports** (never `export * from`) in any `public-api.ts` barrel file.

```ts
// CORRECT
export { ProductCard } from './lib/components/product-card/product-card';

// WRONG — causes NG991010
export * from './lib/components/product-card/product-card';
```

## Adding a New UI Component

1. Create `projects/ui/src/lib/components/<name>/<name>.ts` as a standalone component with `selector: 'lib-<name>'`
2. Add a **named export** to `projects/ui/src/public-api.ts`
3. Import in consuming components via **`@ui/*`** directly:
   ```ts
   import { MyComp } from '@ui/components/my-comp/my-comp';
   ```

## Key Files

| File | Purpose |
|------|---------|
| `angular.json` | Workspace config – all project builders and tsconfigs |
| `tsconfig.json` | Root tsconfig with all path aliases |
| `tailwind.config.js` | Tailwind content paths for store/vendor/admin |
| `projects/ui/src/public-api.ts` | Public API for the UI library |
| `projects/core/src/public-api.ts` | Public API for the core library |
| `projects/models/src/lib/product.model.ts` | `Product` interface |
| `projects/core/src/lib/services/product.service.ts` | `ProductService` (HTTP, uses fakestoreapi temporarily) |
| `projects/store/src/app/app.routes.ts` | Store routing |
