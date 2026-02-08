#!/bin/bash

# Vision Vue Project Structure Creator
# Run this script to create the complete project structure

echo "Creating Vision Vue project structure..."

# Create directory structure
mkdir -p src/{assets/{styles,images},components/{common,layout,portfolio,budget,insights},views,stores,utils,router,composables}
mkdir -p tests/{unit/{stores,utils,components},integration}
mkdir -p public

# Marker files to preserve empty directories in git
touch src/assets/images/.gitkeep
touch public/.gitkeep

echo "✅ Directory structure created"
echo ""
echo "Next steps:"
echo "1. npm install"
echo "2. npm run dev"
echo ""
echo "Project structure:"
tree -L 3 -I 'node_modules'
