# GitHub Actions Release Pipeline

I have successfully created the GitHub Actions workflow to automate the release process for the Clio Notes Chrome Extension.

## What was implemented

A new workflow file has been created at `.github/workflows/release.yml`. This workflow is triggered whenever a tag starting with `v` (e.g., `v1.0.0`) is pushed to the repository, or it can be manually triggered from the GitHub Actions tab.

The workflow performs the following steps:
1. **Checkouts the repository** to access the source code.
2. **Sets up Node.js 20**.
3. **Installs the dependencies** inside the `develop` directory using `npm install`.
4. **Builds the extension** by running the Vite build script (`npm run build`).
5. **Packages the build** by zipping the output located in `develop/dist` into a single file named `clio-notes-extension.zip`.
6. **Publishes a GitHub Release** using the pushed tag and attaches the `clio-notes-extension.zip` file to it.

### Code Changes

```diff:release.yml
===
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install Dependencies
        working-directory: ./develop
        run: npm ci || npm install
        
      - name: Build Extension
        working-directory: ./develop
        run: npm run build
        
      - name: Zip Extension
        working-directory: ./develop/dist
        run: zip -r ../../clio-notes-extension.zip .
        
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: clio-notes-extension.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## How to use it

1. Commit your changes to the `main` branch.
2. Create an annotated tag: `git tag v1.0.0`
3. Push the tag to GitHub: `git push origin v1.0.0`

The pipeline will automatically pick up the tag, build the project, and create a release on GitHub containing the zip artifact.
