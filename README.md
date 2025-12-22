# Bookmarkaholic

A Chrome extension bookmark manager built with React, Vite, and Tailwind CSS.

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Loading the Extension in Chrome

1. Run `pnpm build` to create the production build
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist/` folder from this project

For development with hot reload:

1. Run `pnpm dev` to start the dev server
2. Load the `dist/` folder as an unpacked extension
3. Changes will automatically rebuild

### Available Commands

```bash
pnpm dev      # Start Vite dev server with HMR
pnpm build    # TypeScript check + Vite production build
pnpm preview  # Preview production build
pnpm lint     # Run ESLint
pnpm format   # Format code with Prettier
```

## Tech Stack

- React 18
- Vite with [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- Tailwind CSS 4
- shadcn/ui components
- TypeScript

## License

MIT
