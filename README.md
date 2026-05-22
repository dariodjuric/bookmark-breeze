# Bookmark Breeze

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

## Releasing

Releases are handled by `make-release.sh`, which bumps the version, commits, tags, and builds the packaged zip.

1. Commit or stash all changes — the script aborts if the working directory is not clean.
2. Run the script with the version bump type:

   ```bash
   ./make-release.sh patch   # or minor, or major
   ```

   This will:
   - Bump the version in `package.json` and `manifest.json`
   - Commit the bump as `Release vX.Y.Z` and create a `vX.Y.Z` git tag
   - Run `pnpm zip`, which builds the extension (`pnpm build`) and packages `dist/` into `package.zip`

3. Push the commit and tag:

   ```bash
   git push && git push --tags
   ```

4. Upload `package.zip` to the Chrome Web Store.

You do not need to run `pnpm build` or `pnpm zip` yourself — `make-release.sh` runs the build as part of packaging.

## Tech Stack

- React 18
- Vite with [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- Tailwind CSS 4
- shadcn/ui components
- TypeScript

## License

MIT
