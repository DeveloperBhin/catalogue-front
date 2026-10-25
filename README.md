# Figma Angular App

This Angular application has been set up to implement a Figma design with Tailwind CSS.

## Project Structure

```
src/
├── app/
│   ├── core/              # Core services, guards, interceptors
│   │   └── services/
│   │       └── figma.service.ts
│   ├── shared/            # Shared components, pipes, directives
│   │   ├── components/    # Reusable UI components
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── input/
│   │   │   └── modal/
│   │   └── shared.module.ts
│   ├── features/          # Feature modules (pages/components)
│   │   └── home/
│   ├── layouts/           # Layout components
│   │   ├── header/
│   │   ├── footer/
│   │   └── sidebar/
│   └── app-routing.module.ts
├── assets/
│   ├── images/            # Images from Figma
│   ├── icons/             # Icon assets
│   └── fonts/             # Custom fonts from Figma
└── styles/
    ├── styles.scss        # Global styles + Tailwind
    └── design-tokens.ts   # Design tokens from Figma
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`

### Build

```bash
ng build
```

## Design Tokens

Design tokens are defined in `src/styles/design-tokens.ts` and integrated into Tailwind CSS via `tailwind.config.js`. Update these files with actual values from your Figma design.

## Components

### Layout Components

- **Header**: Main navigation header with mobile menu
- **Footer**: Site footer with links and information
- **Sidebar**: Side navigation (optional)

### Shared Components

- **Button**: Reusable button component with variants (primary, secondary, outline, ghost)
- **Card**: Card component for content containers
- **Input**: Form input component with validation support
- **Modal**: Modal dialog component

## Figma Integration

The project includes a `FigmaService` for fetching design data from Figma API. Note that the provided token requires `file_content:read` scope to access file data.

To use the Figma service:

1. Update the token in `src/app/core/services/figma.service.ts` with a token that has proper scopes
2. Call `getFile()` to fetch the Figma file data
3. Use `extractDesignTokens()` to parse design tokens from the Figma data

## Styling

This project uses Tailwind CSS for styling. Custom design tokens are integrated into Tailwind's theme configuration.

### Customizing Design Tokens

1. Update `src/styles/design-tokens.ts` with values from Figma
2. Update `tailwind.config.js` to use the design tokens
3. Rebuild the project

## Adding New Pages

1. Generate a new feature module:
```bash
ng generate module features/your-feature --routing
ng generate component features/your-feature
```

2. Add route in `src/app/app-routing.module.ts`:
```typescript
{
  path: 'your-feature',
  loadChildren: () => import('./features/your-feature/your-feature.module').then(m => m.YourFeatureModule)
}
```

3. Update the route in the feature's routing module

## Responsive Design

All components are built with responsive design in mind using Tailwind's responsive utilities. The design follows a mobile-first approach.

## Next Steps

1. Export assets from Figma and add them to `src/assets/`
2. Update design tokens with actual values from Figma
3. Customize components to match Figma design specifications
4. Add additional pages/routes as needed
5. Implement business logic and API integrations

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Figma API Documentation](https://www.figma.com/developers/api)
