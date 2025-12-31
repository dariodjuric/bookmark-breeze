# Contributing

Thanks for your interest in contributing to Bookmark Breeze!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch for your changes: `git checkout -b my-feature`

## Development Workflow

1. Run `pnpm dev` to start the development server
2. Load the extension in Chrome from the `dist/` folder
3. Make your changes
4. Run `pnpm lint` to check for linting errors
5. Run `pnpm format` to format your code
6. Run `pnpm build` to verify the build passes

## Submitting Changes

1. Commit your changes with a clear commit message
2. Push to your fork
3. Open a pull request

## Code Style

- Follow existing patterns in the codebase
- Run `pnpm format` before committing

## Releasing (Maintainers)

To create a new release:

1. Ensure you're on `main` with a clean working directory
2. Run the release script: `./make-release.sh <major|minor|patch>`
3. Push the commit and tag: `git push && git push --tags`
4. Upload `package.zip` to the Chrome Web Store

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
