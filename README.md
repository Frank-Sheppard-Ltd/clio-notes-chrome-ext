# Clio Notes (Chrome Extension)

Vite-powered Manifest V3 Chrome extension.

A Manifest V3 Chrome extension that opens a dedicated editor page with:

- File and folder explorer side panel
- Markdown file browsing (`.md`)
- Live markdown preview
- Save support for edited files
- Settings panel with Library for folder management
- Drag-and-drop file and folder moves within the selected root folder
- Create markdown files and folders from Explorer
- Delete files and folders from Explorer
- Set a markdown file as Front Page for each library folder
- Soft delete: deleted files/folders are moved to Trash
- Restore files/folders from Trash using right-click action
- Settings toggle to set Clio Notes as Chrome homepage/start page
- Can be used as Chrome New Tab page

## Features

- Click extension icon to open the editor page.
- Open `Settings`, then add folders to `Library`.
- Reopen saved library folders across sessions.
- Browse nested directories from the left explorer panel.
- Open markdown files and edit in the right editor pane.
- Preview updates live while typing.
- Save with the `Save` button or `Ctrl/Cmd + S`.
- Drag files/folders and drop them on a destination folder in the explorer.
- Drop on the explorer header to move items to the root folder.
- Right-click in Explorer to open actions for files/folders.
- Use context menu actions for `New File`, `New Folder`, `Delete File`, `Delete Folder`, and `Set as Front Page`.
- Front Page is persisted per library folder and auto-opens when that folder is opened.
- Delete actions are soft-delete: items are moved to `/.clio-trash` in the active library root.
- Right-click items inside Trash and use `Restore from Trash` to move them back to the library root.
- In Settings > Chrome Homepage, enable the toggle and click `Apply` to open Chrome startup settings and copy the Clio Notes URL.
- New tabs open Clio Notes through the extension new-tab override.

## Develop and Build

1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Build extension bundle:
   - `npm run build`

Build output is generated in `dist/`.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder:
   - `/Users/ciobanuf/Documents/notes/chrome-markdown-explorer/dist`

## Notes

- Uses the browser File System Access API through explicit user folder selection.
- File access is limited to the folder you choose.
- The explorer shows only `.md` files.
- Extension manifest is sourced from `public/manifest.json` for Vite builds.
- After manifest changes, reload the unpacked extension in `chrome://extensions`.
