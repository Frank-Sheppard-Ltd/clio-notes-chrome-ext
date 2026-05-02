# Clio Notes (Virgule) - User Guide

Welcome to Clio Notes, a powerful Manifest V3 Chrome extension designed to transform your browser into a robust, local-first Markdown editor and file explorer.

## Getting Started

### Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the built extension folder (`dist/`).

### Initial Launch & Lock Screen
Upon launching the extension or opening a new tab, you will be greeted by the **Lock Screen**.
- **Security & Privacy:** The lock screen acts as a mandatory initial landing page to protect your workspace.
- **Multi-Engine Search:** From the lock screen, you can select multiple search engines from the dynamic dropdown and perform simultaneous web searches in new tabs.

## Core Features

### Workspace & Library Management
- **Library Settings:** Open `Settings` to add local folders to your `Library`. The extension uses the browser's File System Access API, meaning your files stay securely on your local machine and are only accessible with your permission.
- **Persistence:** Saved library folders are remembered across sessions.
- **File Explorer:** A dedicated left side panel allows you to browse nested directories, showing only relevant Markdown (`.md`) files.
- **Front Page:** You can set a specific Markdown file as the "Front Page" for any library folder. This file will automatically open whenever that folder is selected.

### Editing & Formatting
- **Live Markdown Editor:** Edit Markdown files in the right pane with real-time previews updating live as you type.
- **Auto-Headers:** When creating a new Markdown file, a hash symbol (`#`) is automatically inserted on the first line to speed up your workflow.
- **Persistent Toolbar:** Use the editor toolbar to easily access **Save**, **Format**, and **Preview** functions. You can also use `Ctrl/Cmd + S` to save.
- **Dark Mode:** Toggle the class-based dark mode theme for comfortable writing in low-light environments. Your theme preference is saved consistently across sessions.

### File & Folder Operations
- **Drag-and-Drop Organization:** Move files and folders by dragging them and dropping them onto destination folders in the explorer. Drop items on the explorer header to move them to the root folder.
- **Context Menu:** Right-click anywhere in the Explorer to quickly create a **New File** or **New Folder**.
- **Auto-Open:** Newly created Markdown files automatically open in a new tab for immediate editing.
- **Soft Delete & Trash:** Deleting files or folders moves them to a `.clio-trash` folder in the active library root. You can easily restore them by right-clicking items inside the Trash and selecting **Restore from Trash**.

### Photo Support
- **Drag-and-Drop Images:** Add photos to your Markdown notes by simply dropping image files directly onto the editor pane.
- **Automated Storage:** Dropped images are automatically saved into an `images/` subfolder relative to your currently opened Markdown file.
- **Seamless Markdown Integration:** The correct Markdown image syntax (e.g., `![alt](./images/filename)`) is automatically inserted at your cursor position, and the preview will instantly display the local image.
- **Insert Image Button:** You can also use the "Insert Image" button in the toolbar to open a file picker as an alternative.

## Advanced Settings
- **Chrome Homepage/Start Page:** In Settings > Chrome Homepage, you can enable a toggle to set Clio Notes as your default startup page.
- **New Tab Override:** By default, Clio Notes overrides your new tab page, keeping your notes just a keystroke away.
