# Virgule

Virgule is a powerful Manifest V3 Chrome extension that transforms your browser into a robust, local-first Markdown editor and file explorer. Designed with a focus on privacy and productivity, it features real-time markdown previews, persistent library management, a dark mode theme, a secure multi-engine web search lock screen, and seamless drag-and-drop support for files and photos. All your data stays securely on your local machine leveraging the browser's File System Access API.

## Installation

### From Pre-built Source
1. Download the latest release from the [releases](https://github.com/Frank-Sheppard-Ltd/clio-notes-chrome-ext/releases) page.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `dist/` folder built from this repository.

### Build from Source
If you wish to build the extension yourself:
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension bundle:
   ```bash
   npm run build
   ```
4. Load the generated `dist/` folder into Chrome as described above.

## Documentation

For a comprehensive guide on features, workspace management, and advanced settings, please refer to our official documentation:
- [User Documentation](../doc/user_documentation.md)

## Contributing

We welcome contributions to Virgule! To contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please make sure your code adheres to the project's existing style and ensure any new features are adequately tested before submitting.
