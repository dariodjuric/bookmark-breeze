#!/bin/bash
set -e

# Validate argument
if [[ ! "$1" =~ ^(major|minor|patch)$ ]]; then
  echo "Usage: ./make-release.sh <major|minor|patch>"
  exit 1
fi

# Ensure working directory is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Working directory is not clean. Commit or stash changes first."
  exit 1
fi

# Get current version from package.json
VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')

# Parse version parts
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Bump appropriate part
case $1 in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo "Bumping version: $VERSION -> $NEW_VERSION"

# Update package.json
sed -i '' "s/\"version\": \"$VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update manifest.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" manifest.json

# Commit version bump
git add package.json manifest.json
git commit -m "Release v$NEW_VERSION"

# Create tag
git tag "v$NEW_VERSION"

echo "Created tag v$NEW_VERSION"

# Build and package
pnpm zip

echo ""
echo "Release v$NEW_VERSION complete!"
echo "Next steps:"
echo "  1. git push && git push --tags"
echo "  2. Upload package.zip to Chrome Web Store"
