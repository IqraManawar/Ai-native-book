#!/bin/bash
# Deploy script for AI-Native Textbook to GitHub Pages
# Usage: ./scripts/deploy.sh [--skip-build]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBSITE_DIR="$PROJECT_ROOT/my-website"
BUILD_DIR="$WEBSITE_DIR/build"

echo -e "${GREEN}=== AI-Native Textbook Deployment ===${NC}"
echo "Project root: $PROJECT_ROOT"
echo "Website dir: $WEBSITE_DIR"

# Check if we should skip the build
SKIP_BUILD=false
if [[ "$1" == "--skip-build" ]]; then
    SKIP_BUILD=true
    echo -e "${YELLOW}Skipping build step...${NC}"
fi

# Navigate to website directory
cd "$WEBSITE_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm ci
fi

# Build the site (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}Building the site...${NC}"
    npm run build
fi

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory not found at $BUILD_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"
echo "Build output: $BUILD_DIR"

# Check for gh-pages branch
if ! git rev-parse --verify gh-pages >/dev/null 2>&1; then
    echo -e "${YELLOW}Creating gh-pages branch...${NC}"
    git checkout --orphan gh-pages
    git reset --hard
    git commit --allow-empty -m "Initialize gh-pages branch"
    git checkout -
fi

# Deploy using Docusaurus deploy command
echo -e "${YELLOW}Deploying to GitHub Pages...${NC}"
echo "Note: You may need to configure the following in docusaurus.config.ts:"
echo "  - organizationName: your GitHub username or org"
echo "  - projectName: your repository name"
echo "  - deploymentBranch: 'gh-pages'"

# Option 1: Use Docusaurus deploy (requires GitHub credentials)
# GIT_USER=<your-github-username> npm run deploy

# Option 2: Manual deploy to gh-pages branch
echo ""
echo "To deploy manually, run:"
echo "  cd $BUILD_DIR"
echo "  git init"
echo "  git add -A"
echo "  git commit -m 'Deploy to GitHub Pages'"
echo "  git push -f git@github.com:<username>/<repo>.git main:gh-pages"

echo ""
echo -e "${GREEN}=== Deployment Preparation Complete ===${NC}"
echo ""
echo "Build artifacts are ready in: $BUILD_DIR"
echo ""
echo "Next steps:"
echo "1. Configure GitHub repository settings:"
echo "   - Go to Settings > Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: gh-pages"
echo ""
echo "2. Run the deploy command:"
echo "   GIT_USER=<username> npm run deploy"
echo ""
echo "Or use GitHub Actions for automated deployment (see .github/workflows/deploy.yml)"
