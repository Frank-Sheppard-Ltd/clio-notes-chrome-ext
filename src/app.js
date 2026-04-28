const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const addLibraryFolderBtn = document.getElementById("add-library-folder-btn");
const libraryList = document.getElementById("library-list");
const homepageToggle = document.getElementById("homepage-toggle");
const applyHomepageBtn = document.getElementById("apply-homepage-btn");
const homepageUrlLabel = document.getElementById("homepage-url");
const saveBtn = document.getElementById("save-btn");
const insertImageBtn = document.getElementById("insert-image-btn");
const explorer = document.querySelector(".explorer");
const treeRoot = document.getElementById("tree-root");
const folderName = document.getElementById("folder-name");
const explorerHead = document.querySelector(".explorer-head");
const filePathLabel = document.getElementById("file-path");
const statusLabel = document.getElementById("status");
const togglePreviewBtn = document.getElementById("toggle-preview-btn");
const editor = document.getElementById("editor");
const editorDropZone = document.getElementById("editor-drop-zone");
const preview = document.getElementById("preview");
const panes = document.querySelector(".panes");
const contextMenu = document.getElementById("context-menu");
const contextMenuItems = Array.from(contextMenu.querySelectorAll(".context-menu-item"));

const LIBRARY_DB_NAME = "clio-notes-db";
const LIBRARY_DB_VERSION = 1;
const LIBRARY_STORE_NAME = "libraryFolders";
const ACTIVE_LIBRARY_KEY = "clio-notes-active-library-folder-id";
const FRONT_PAGE_MAP_KEY = "clio-notes-front-page-by-folder";
const TRASH_DIR_NAME = ".clio-trash";
const HOMEPAGE_ENABLED_KEY = "clio-notes-homepage-enabled";

const state = {
  libraryFolders: [],
  activeLibraryFolderId: "",
  rootHandle: null,
  currentFileHandle: null,
  currentFilePath: "",
  currentFileButton: null,
  dragSourcePath: "",
  dragSourceKind: "",
  previewVisible: true,
  explorerSelectionKind: "",
  explorerSelectionPath: "",
  explorerSelectionParentPath: "",
  settingsOpen: false,
  homepageEnabled: false,
  contextMenuTargetKind: "",
  contextMenuTargetPath: "",
  contextMenuParentPath: "",
  frontPageByFolder: {},
  imageCache: {}
};

settingsBtn.addEventListener("click", toggleSettingsPanel);
closeSettingsBtn.addEventListener("click", () => setSettingsPanelOpen(false));
addLibraryFolderBtn.addEventListener("click", () => {
  void addFolderToLibrary();
});
homepageToggle.addEventListener("change", onHomepageToggleChange);
applyHomepageBtn.addEventListener("click", () => {
  void applyHomepageSetting();
});
saveBtn.addEventListener("click", saveCurrentFile);
insertImageBtn.addEventListener("click", () => void onInsertImageClick());
togglePreviewBtn.addEventListener("click", togglePreview);
editor.addEventListener("input", () => renderPreview(editor.value));
editorDropZone.addEventListener("dragover", onEditorDragOver);
editorDropZone.addEventListener("dragleave", onEditorDragLeave);
editorDropZone.addEventListener("drop", onEditorDrop);
explorer.addEventListener("contextmenu", onExplorerContextMenu);
explorerHead.addEventListener("click", () => {
  if (!state.rootHandle) {
    return;
  }
  setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
});
updatePreviewVisibility();
document.addEventListener("click", () => hideContextMenu(), true);
document.addEventListener("pointerdown", onGlobalPointerDown, true);
document.addEventListener("contextmenu", onGlobalContextMenu);
window.addEventListener("resize", () => hideContextMenu());
window.addEventListener("scroll", () => hideContextMenu(), true);
window.addEventListener("blur", () => hideContextMenu());

contextMenuItems.forEach((item) => {
  item.addEventListener("click", () => {
    void onContextMenuAction(item.dataset.action || "");
  });
});

initializeHomepageSettings();
void initializeLibrary();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideContextMenu();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (!saveBtn.disabled) {
      void saveCurrentFile();
    }
  }
});

function setStatus(message) {
  statusLabel.textContent = message;
}

function getClioNotesUrl() {
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL("app.html");
  }

  return window.location.href;
}

function initializeHomepageSettings() {
  state.homepageEnabled = localStorage.getItem(HOMEPAGE_ENABLED_KEY) === "1";
  renderHomepageSettings();
}

function renderHomepageSettings() {
  const appUrl = getClioNotesUrl();
  homepageUrlLabel.textContent = appUrl;
  homepageToggle.checked = state.homepageEnabled;
  applyHomepageBtn.disabled = !state.homepageEnabled;
}

function onHomepageToggleChange() {
  state.homepageEnabled = homepageToggle.checked;
  localStorage.setItem(HOMEPAGE_ENABLED_KEY, state.homepageEnabled ? "1" : "0");
  renderHomepageSettings();

  if (state.homepageEnabled) {
    void applyHomepageSetting();
    return;
  }

  setStatus("Homepage setup toggle is off.");
}

async function applyHomepageSetting() {
  if (!state.homepageEnabled) {
    setStatus("Enable homepage setup first.");
    return;
  }

  const appUrl = getClioNotesUrl();
  let copied = false;

  try {
    await navigator.clipboard.writeText(appUrl);
    copied = true;
  } catch {
    copied = false;
  }

  openChromeStartupSettings();

  if (copied) {
    setStatus("Homepage URL copied. In Chrome startup settings choose specific page and paste it.");
    return;
  }

  setStatus("Open startup settings and set this page: " + appUrl);
}

function openChromeStartupSettings() {
  window.open("chrome://settings/onStartup", "_blank", "noopener");
}

function onExplorerContextMenu(event) {
  if (!state.rootHandle) {
    return;
  }

  const folderTarget = event.target.closest(".folder-summary");
  const fileTarget = event.target.closest(".file-button");

  event.preventDefault();

  if (folderTarget) {
    const fullPath = folderTarget.dataset.entryPath || "";
    const relativePath = removeRootPrefix(fullPath);
    const insideTrash = isPathInTrash(relativePath);
    const isTrashRoot = relativePath === TRASH_DIR_NAME;
    state.contextMenuTargetKind = "folder";
    state.contextMenuTargetPath = fullPath;
    state.contextMenuParentPath = folderTarget.dataset.parentPath || state.rootHandle.name;
    if (insideTrash && !isTrashRoot) {
      showContextMenu(event.clientX, event.clientY, ["restore-from-trash"]);
      return;
    }

    showContextMenu(event.clientX, event.clientY, ["new-file", "new-folder", "delete-folder"]);
    return;
  }

  if (fileTarget) {
    const fullPath = fileTarget.dataset.entryPath || "";
    const relativePath = removeRootPrefix(fullPath);
    const insideTrash = isPathInTrash(relativePath);
    state.contextMenuTargetKind = "file";
    state.contextMenuTargetPath = fullPath;
    state.contextMenuParentPath = fileTarget.dataset.parentPath || state.rootHandle.name;
    if (insideTrash) {
      showContextMenu(event.clientX, event.clientY, ["restore-from-trash"]);
      return;
    }

    showContextMenu(event.clientX, event.clientY, ["new-file", "new-folder", "delete-file", "set-front-page"]);
    return;
  }

  state.contextMenuTargetKind = "root";
  state.contextMenuTargetPath = state.rootHandle.name;
  state.contextMenuParentPath = state.rootHandle.name;
  showContextMenu(event.clientX, event.clientY, ["new-file", "new-folder"]);
}

function onGlobalPointerDown(event) {
  if (contextMenu.hidden) {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (contextMenu.contains(event.target)) {
    return;
  }

  hideContextMenu();
}

function onGlobalContextMenu(event) {
  if (explorer.contains(event.target)) {
    return;
  }

  hideContextMenu();
}

function showContextMenu(clientX, clientY, allowedActions) {
  contextMenuItems.forEach((item) => {
    const action = item.dataset.action || "";
    item.hidden = !allowedActions.includes(action);
  });

  contextMenu.hidden = false;

  const rect = contextMenu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = Math.min(clientX, viewportWidth - rect.width - 8);
  const top = Math.min(clientY, viewportHeight - rect.height - 8);

  contextMenu.style.left = Math.max(8, left) + "px";
  contextMenu.style.top = Math.max(8, top) + "px";
}

function hideContextMenu() {
  if (!contextMenu.hidden) {
    contextMenu.hidden = true;
  }
}

async function onContextMenuAction(action) {
  hideContextMenu();

  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  const targetKind = state.contextMenuTargetKind;
  const targetRelativePath = removeRootPrefix(state.contextMenuTargetPath);
  const parentRelativePath = removeRootPrefix(state.contextMenuParentPath);

  if (action === "new-file") {
    if (targetKind === "folder") {
      await createMarkdownFile(targetRelativePath);
      return;
    }

    if (targetKind === "file") {
      await createMarkdownFile(parentRelativePath);
      return;
    }

    await createMarkdownFile("");
    return;
  }

  if (action === "new-folder") {
    if (targetKind === "folder") {
      await createFolder(targetRelativePath);
      return;
    }

    if (targetKind === "file") {
      await createFolder(parentRelativePath);
      return;
    }

    await createFolder("");
    return;
  }

  if (action === "delete-file" && targetKind === "file") {
    await deleteFile(state.contextMenuTargetPath);
    return;
  }

  if (action === "delete-folder" && targetKind === "folder") {
    await deleteFolder(state.contextMenuTargetPath);
    return;
  }

  if (action === "set-front-page" && targetKind === "file") {
    setFrontPageForActiveFolder(state.contextMenuTargetPath);
    return;
  }

  if (action === "restore-from-trash" && (targetKind === "file" || targetKind === "folder")) {
    await restoreFromTrash(state.contextMenuTargetPath, targetKind);
  }
}

function toggleSettingsPanel() {
  setSettingsPanelOpen(!state.settingsOpen);
}

function setSettingsPanelOpen(isOpen) {
  state.settingsOpen = isOpen;
  settingsPanel.hidden = !isOpen;
}

async function initializeLibrary() {
  try {
    state.frontPageByFolder = loadFrontPageMap();
    state.libraryFolders = await getStoredLibraryFolders();
    renderLibraryList();

    const storedActiveId = localStorage.getItem(ACTIVE_LIBRARY_KEY) || "";
    const activeEntry = state.libraryFolders.find((entry) => entry.id === storedActiveId);
    if (activeEntry) {
      const canOpen = await hasReadWritePermission(activeEntry.handle);
      if (canOpen) {
        state.activeLibraryFolderId = activeEntry.id;
        await loadRootFolder(activeEntry.handle);
        return;
      }
    }

    setStatus("Open Settings > Library and add a folder to get started.");
  } catch (error) {
    console.error(error);
    setStatus("Unable to load saved library folders.");
  }
}

async function hasReadWritePermission(handle) {
  const options = { mode: "readwrite" };
  const current = await handle.queryPermission(options);
  return current === "granted";
}

function renderLibraryList() {
  libraryList.innerHTML = "";

  if (!state.libraryFolders.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "library-item muted";
    emptyItem.textContent = "No folders in library yet.";
    libraryList.appendChild(emptyItem);
    return;
  }

  for (const entry of state.libraryFolders) {
    const item = document.createElement("li");
    item.className = "library-item";

    const name = document.createElement("span");
    name.className = "library-item-name";
    name.textContent = entry.name;

    if (entry.id === state.activeLibraryFolderId) {
      name.classList.add("is-active");
    }

    const actions = document.createElement("div");
    actions.className = "library-item-actions";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "button button-quiet";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => {
      void openLibraryFolder(entry.id);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "button button-quiet";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      void removeLibraryFolder(entry.id);
    });

    actions.appendChild(openBtn);
    actions.appendChild(removeBtn);
    item.appendChild(name);
    item.appendChild(actions);
    libraryList.appendChild(item);
  }
}

async function addFolderToLibrary() {
  if (!window.showDirectoryPicker) {
    setStatus("File System Access API is not available in this browser version.");
    return;
  }

  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    const duplicate = await findDuplicateLibraryEntry(handle);
    if (duplicate) {
      setStatus("Folder already exists in Library.");
      await openLibraryFolder(duplicate.id);
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      name: handle.name,
      handle,
      createdAt: Date.now()
    };

    await putStoredLibraryFolder(entry);
    state.libraryFolders = await getStoredLibraryFolders();
    renderLibraryList();
    await openLibraryFolder(entry.id);
  } catch (error) {
    if (error && error.name === "AbortError") {
      setStatus("Folder selection canceled.");
      return;
    }

    console.error(error);
    setStatus("Unable to add folder to Library.");
  }
}

async function findDuplicateLibraryEntry(newHandle) {
  for (const entry of state.libraryFolders) {
    try {
      if (await entry.handle.isSameEntry(newHandle)) {
        return entry;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function openLibraryFolder(folderId) {
  const entry = state.libraryFolders.find((folder) => folder.id === folderId);
  if (!entry) {
    setStatus("Library folder was not found.");
    return;
  }

  try {
    const hasPermission = await ensureReadWritePermission(entry.handle);
    if (!hasPermission) {
      setStatus("Permission was not granted for this library folder.");
      return;
    }

    state.activeLibraryFolderId = folderId;
    localStorage.setItem(ACTIVE_LIBRARY_KEY, folderId);
    await loadRootFolder(entry.handle);
    renderLibraryList();
    setStatus("Opened library folder " + entry.name + ".");
    await tryOpenFrontPageForActiveFolder();
  } catch (error) {
    console.error(error);
    setStatus("Unable to open selected library folder.");
  }
}

async function removeLibraryFolder(folderId) {
  const entry = state.libraryFolders.find((folder) => folder.id === folderId);
  if (!entry) {
    return;
  }

  const confirmed = window.confirm("Remove " + entry.name + " from Library?");
  if (!confirmed) {
    return;
  }

  await deleteStoredLibraryFolder(folderId);
  delete state.frontPageByFolder[folderId];
  saveFrontPageMap();
  state.libraryFolders = await getStoredLibraryFolders();

  if (state.activeLibraryFolderId === folderId) {
    state.activeLibraryFolderId = "";
    localStorage.removeItem(ACTIVE_LIBRARY_KEY);
    state.rootHandle = null;
    clearCurrentSelection();
    folderName.textContent = "No folder selected";
    treeRoot.innerHTML = '<p class="muted">Choose a folder from Settings > Library.</p>';
    updateExplorerActionButtons();
  }

  renderLibraryList();
  setStatus("Removed " + entry.name + " from Library.");
}

async function loadRootFolder(handle) {
  state.rootHandle = handle;
  state.currentFileHandle = null;
  state.currentFilePath = "";
  filePathLabel.textContent = "No file opened";
  editor.value = "";
  renderPreview("");
  saveBtn.disabled = true;
  folderName.textContent = handle.name;
  setExplorerSelection("root", handle.name, handle.name);
  await refreshTree();
}

function openLibraryDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LIBRARY_DB_NAME, LIBRARY_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LIBRARY_STORE_NAME)) {
        db.createObjectStore(LIBRARY_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getStoredLibraryFolders() {
  const db = await openLibraryDatabase();
  const folders = await new Promise((resolve, reject) => {
    const tx = db.transaction(LIBRARY_STORE_NAME, "readonly");
    const store = tx.objectStore(LIBRARY_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
  db.close();

  return folders.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

async function putStoredLibraryFolder(entry) {
  const db = await openLibraryDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(LIBRARY_STORE_NAME, "readwrite");
    const store = tx.objectStore(LIBRARY_STORE_NAME);
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

async function deleteStoredLibraryFolder(folderId) {
  const db = await openLibraryDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(LIBRARY_STORE_NAME, "readwrite");
    const store = tx.objectStore(LIBRARY_STORE_NAME);
    const request = store.delete(folderId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

function createBootstrapIconElement(iconName, className) {
  const iconPaths = {
    "file-earmark-plus": [
      "M6.5 0A1.5 1.5 0 0 0 5 1.5V14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4.5L10.5 0zM10 1.5V4a1 1 0 0 0 1 1h2.5z",
      "M8 6a.5.5 0 0 1 .5.5V8H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V9H6a.5.5 0 0 1 0-1h1.5V6.5A.5.5 0 0 1 8 6"
    ],
    "folder-plus": [
      "M.5 3a2 2 0 0 1 2-2H5a2 2 0 0 1 1.414.586L7.414 2.586A2 2 0 0 0 8.828 3H13.5a2 2 0 0 1 2 2v1H.5z",
      "M.5 5.5A1.5 1.5 0 0 1 2 4h12a1.5 1.5 0 0 1 1.493 1.356l-.727 6A1.5 1.5 0 0 1 13.274 13H2.726a1.5 1.5 0 0 1-1.492-1.644z",
      "M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"
    ],
    "file-earmark-x": [
      "M6.5 0A1.5 1.5 0 0 0 5 1.5V14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4.5L10.5 0zM10 1.5V4a1 1 0 0 0 1 1h2.5z",
      "M6.646 6.646a.5.5 0 0 1 .708 0L8 7.293l.646-.647a.5.5 0 1 1 .708.708L8.707 8l.647.646a.5.5 0 0 1-.708.708L8 8.707l-.646.647a.5.5 0 0 1-.708-.708L7.293 8l-.647-.646a.5.5 0 0 1 0-.708"
    ],
    "folder-x": [
      "M.5 3a2 2 0 0 1 2-2H5a2 2 0 0 1 1.414.586L7.414 2.586A2 2 0 0 0 8.828 3H13.5a2 2 0 0 1 2 2v1H.5z",
      "M.5 5.5A1.5 1.5 0 0 1 2 4h12a1.5 1.5 0 0 1 1.493 1.356l-.727 6A1.5 1.5 0 0 1 13.274 13H2.726a1.5 1.5 0 0 1-1.492-1.644z",
      "M6.854 7.146a.5.5 0 0 0-.708.708L6.793 8.5l-.647.646a.5.5 0 0 0 .708.708L7.5 9.207l.646.647a.5.5 0 0 0 .708-.708L8.207 8.5l.647-.646a.5.5 0 0 0-.708-.708L7.5 7.793z"
    ],
    folder2: [
      "M.5 3a2 2 0 0 1 2-2h2.586a1 1 0 0 1 .707.293L7.5 3H13.5a2 2 0 0 1 2 2v1h-15z",
      "M0 5.5A1.5 1.5 0 0 1 1.5 4h13A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13h-13A1.5 1.5 0 0 1 0 11.5z"
    ],
    "file-earmark-text": [
      "M6.5 0A1.5 1.5 0 0 0 5 1.5V14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4.5L10.5 0zM10 1.5V4a1 1 0 0 0 1 1h2.5z",
      "M6 8.5A.5.5 0 0 1 6.5 8h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 6 8.5m0 2A.5.5 0 0 1 6.5 10h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5M6.5 6a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"
    ]
  };

  const paths = iconPaths[iconName] || iconPaths["file-earmark-text"];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("bi");
  if (className) {
    svg.classList.add(className);
  }

  for (const d of paths) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  }

  return svg;
}

function togglePreview() {
  state.previewVisible = !state.previewVisible;
  updatePreviewVisibility();
}

function updatePreviewVisibility() {
  panes.classList.toggle("is-preview-hidden", !state.previewVisible);
  togglePreviewBtn.textContent = state.previewVisible ? "Hide Preview" : "Show Preview";
  togglePreviewBtn.setAttribute("aria-pressed", String(!state.previewVisible));
}

function setExplorerSelection(kind, fullPath, parentFullPath) {
  state.explorerSelectionKind = kind;
  state.explorerSelectionPath = fullPath;
  state.explorerSelectionParentPath = parentFullPath;
  updateExplorerActionButtons();
}

function updateExplorerActionButtons() {
  // Actions are handled through the explorer context menu.
}

async function buildFolderTree(dirHandle, pathPrefix) {
  const container = document.createElement("ul");

  const directories = [];
  const markdownFiles = [];

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "directory") {
      directories.push({ name, handle });
    } else if (handle.kind === "file" && /\.md$/i.test(name)) {
      markdownFiles.push({ name, handle });
    }
  }

  directories.sort((a, b) => a.name.localeCompare(b.name));
  markdownFiles.sort((a, b) => a.name.localeCompare(b.name));

  for (const directory of directories) {
    const item = document.createElement("li");
    item.className = "tree-item";

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.className = "folder-summary";
    summary.draggable = true;
    const summaryRow = document.createElement("span");
    summaryRow.className = "tree-row";

    const label = document.createElement("span");
    label.className = "tree-label";

    const folderIcon = createBootstrapIconElement("folder2", "item-icon");

    const folderNameText = document.createElement("span");
    folderNameText.className = "item-name";
    folderNameText.textContent = directory.name;

    label.appendChild(folderIcon);
    label.appendChild(folderNameText);

    const folderPath = pathPrefix + "/" + directory.name;
    summary.dataset.entryType = "folder";
    summary.dataset.entryPath = folderPath;
    summary.dataset.parentPath = pathPrefix;
    summary.addEventListener("click", () => {
      setExplorerSelection("folder", folderPath, pathPrefix);
    });

    attachDragSource(summary, {
      kind: "folder",
      sourcePath: folderPath
    });

    attachDropTarget(summary, removeRootPrefix(folderPath));

    summaryRow.appendChild(label);
    summary.appendChild(summaryRow);

    details.appendChild(summary);
    details.appendChild(await buildFolderTree(directory.handle, folderPath));

    item.appendChild(details);
    container.appendChild(item);
  }

  for (const file of markdownFiles) {
    const item = document.createElement("li");
    item.className = "tree-item";

    const row = document.createElement("div");
    row.className = "tree-row";

    const button = document.createElement("button");
    button.className = "file-button";
    button.type = "button";
    button.draggable = true;

    const fileLabel = document.createElement("span");
    fileLabel.className = "tree-label";

    const fileIcon = createBootstrapIconElement("file-earmark-text", "item-icon");

    const fileNameText = document.createElement("span");
    fileNameText.className = "item-name";
    fileNameText.textContent = file.name;

    fileLabel.appendChild(fileIcon);
    fileLabel.appendChild(fileNameText);
    button.appendChild(fileLabel);

    const filePath = pathPrefix + "/" + file.name;
    button.dataset.entryType = "file";
    button.dataset.entryPath = filePath;
    button.dataset.parentPath = pathPrefix;

    button.addEventListener("click", () => {
      setExplorerSelection("file", filePath, pathPrefix);
      void openMarkdownFile(file.handle, filePath, button);
    });

    attachDragSource(button, {
      kind: "file",
      sourcePath: filePath
    });

    row.appendChild(button);

    item.appendChild(row);
    container.appendChild(item);
  }

  if (!directories.length && !markdownFiles.length) {
    const empty = document.createElement("li");
    empty.className = "tree-item muted";
    empty.textContent = "(empty)";
    container.appendChild(empty);
  }

  return container;
}

async function refreshTree() {
  if (!state.rootHandle) {
    return;
  }

  treeRoot.innerHTML = "";
  attachDropTarget(explorerHead, "");
  const tree = await buildFolderTree(state.rootHandle, state.rootHandle.name);
  treeRoot.appendChild(tree);
}

async function openMarkdownFile(fileHandle, filePath, clickedButton) {
  try {
    const hasPermission = await ensureReadWritePermission(fileHandle);
    if (!hasPermission) {
      setStatus("Read/write permission was not granted for this file.");
      return;
    }

    const file = await fileHandle.getFile();
    const text = await file.text();

    state.currentFileHandle = fileHandle;
    state.currentFilePath = filePath;

    if (state.currentFileButton) {
      state.currentFileButton.classList.remove("is-active");
    }

    const targetButton = clickedButton || findFileButtonByPath(filePath);
    if (targetButton) {
      targetButton.classList.add("is-active");
      state.currentFileButton = targetButton;
    } else {
      state.currentFileButton = null;
    }

    filePathLabel.textContent = filePath;
    editor.value = text;
    insertImageBtn.disabled = false;
    saveBtn.disabled = false;
    await updateImageBlobCache();
    renderPreview(text);
    setStatus("File opened.");
  } catch (error) {
    console.error(error);
    setStatus("Unable to open selected file.");
  }
}

async function ensureReadWritePermission(fileHandle) {
  const options = { mode: "readwrite" };

  const current = await fileHandle.queryPermission(options);
  if (current === "granted") {
    return true;
  }

  const requested = await fileHandle.requestPermission(options);
  return requested === "granted";
}

async function saveCurrentFile() {
  if (!state.currentFileHandle) {
    setStatus("Open a file first.");
    return;
  }

  try {
    const writable = await state.currentFileHandle.createWritable();
    await writable.write(editor.value);
    await writable.close();
    setStatus("Saved " + state.currentFilePath);
  } catch (error) {
    console.error(error);
    setStatus("Save failed.");
  }
}

async function createMarkdownFile(destinationPathOverride) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  try {
    const destinationPath = typeof destinationPathOverride === "string" ? destinationPathOverride : "";

    const inputName = window.prompt("File name (use .md):", "new-note.md");
    if (inputName === null) {
      setStatus("Create file canceled.");
      return;
    }

    const trimmed = inputName.trim();
    if (!trimmed) {
      setStatus("File name cannot be empty.");
      return;
    }

    if (trimmed.includes("/")) {
      setStatus("File name cannot contain '/'.");
      return;
    }

    const fileName = /\.md$/i.test(trimmed) ? trimmed : trimmed + ".md";
    const targetDir = await getDirectoryHandleByRelativePath(destinationPath);

    const fileExists = await fileExistsInDirectory(targetDir, fileName);
    const dirExists = await directoryExistsInDirectory(targetDir, fileName);
    if (fileExists || dirExists) {
      setStatus("An item named " + fileName + " already exists in " + formatRelativePath(destinationPath));
      return;
    }

    await targetDir.getFileHandle(fileName, { create: true });
    await refreshTree();
    setStatus("Created " + fileName + " in " + formatRelativePath(destinationPath));
  } catch (error) {
    console.error(error);
    setStatus("Unable to create file.");
  }
}

async function createFolder(destinationPathOverride) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  try {
    const destinationPath = typeof destinationPathOverride === "string" ? destinationPathOverride : "";

    const inputName = window.prompt("Folder name:", "new-folder");
    if (inputName === null) {
      setStatus("Create folder canceled.");
      return;
    }

    const folderNameInput = inputName.trim();
    if (!folderNameInput) {
      setStatus("Folder name cannot be empty.");
      return;
    }

    if (folderNameInput.includes("/")) {
      setStatus("Folder name cannot contain '/'.");
      return;
    }

    const targetDir = await getDirectoryHandleByRelativePath(destinationPath);
    const fileExists = await fileExistsInDirectory(targetDir, folderNameInput);
    const dirExists = await directoryExistsInDirectory(targetDir, folderNameInput);
    if (fileExists || dirExists) {
      setStatus("An item named " + folderNameInput + " already exists in " + formatRelativePath(destinationPath));
      return;
    }

    await targetDir.getDirectoryHandle(folderNameInput, { create: true });
    await refreshTree();
    setStatus("Created folder " + folderNameInput + " in " + formatRelativePath(destinationPath));
  } catch (error) {
    console.error(error);
    setStatus("Unable to create folder.");
  }
}

async function deleteFile(sourcePath) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  const confirmed = window.confirm("Move file " + sourcePath + " to Trash?");
  if (!confirmed) {
    setStatus("Move to Trash canceled.");
    return;
  }

  try {
    const sourceRelative = removeRootPrefix(sourcePath);
    const movedName = await moveFileToTrash(sourceRelative);

    if (state.activeLibraryFolderId) {
      const frontPagePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
      if (frontPagePath === sourceRelative) {
        clearFrontPageForActiveFolder();
      }
    }

    if (state.currentFilePath === sourcePath) {
      clearCurrentSelection();
    }

    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    setStatus("Moved file to Trash: " + movedName);
  } catch (error) {
    console.error(error);
    if (error && typeof error.message === "string" && error.message.includes("already in Trash")) {
      setStatus(error.message);
      return;
    }
    setStatus("Unable to move file to Trash.");
  }
}

async function deleteFolder(sourcePath) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  const confirmed = window.confirm("Move folder " + sourcePath + " and all contents to Trash?");
  if (!confirmed) {
    setStatus("Move to Trash canceled.");
    return;
  }

  try {
    const sourceRelative = removeRootPrefix(sourcePath);
    const movedName = await moveFolderToTrash(sourceRelative);

    if (state.activeLibraryFolderId) {
      const frontPagePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
      if (frontPagePath === sourceRelative || frontPagePath.startsWith(sourceRelative + "/")) {
        clearFrontPageForActiveFolder();
      }
    }

    if (state.currentFilePath && removeRootPrefix(state.currentFilePath).startsWith(sourceRelative + "/")) {
      clearCurrentSelection();
    }

    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    setStatus("Moved folder to Trash: " + movedName);
  } catch (error) {
    console.error(error);
    if (error && typeof error.message === "string" && error.message.includes("already in Trash")) {
      setStatus(error.message);
      return;
    }
    setStatus("Unable to move folder to Trash.");
  }
}

async function moveFile(sourcePath, destinationPath) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  try {
    const sourceRelative = removeRootPrefix(sourcePath);
    const sourceInfo = splitParentAndName(sourceRelative);

    if (sourceInfo.parentPath === destinationPath) {
      setStatus("Source and destination are the same folder.");
      return;
    }

    const sourceParentHandle = await getDirectoryHandleByRelativePath(sourceInfo.parentPath);
    const destinationHandle = await getDirectoryHandleByRelativePath(destinationPath);

    const sourceFileHandle = await sourceParentHandle.getFileHandle(sourceInfo.name);
    const alreadyExists = await fileExistsInDirectory(destinationHandle, sourceInfo.name);
    if (alreadyExists) {
      setStatus("Destination already has a file named " + sourceInfo.name + ".");
      return;
    }

    await copyFileToDirectory(sourceFileHandle, destinationHandle, sourceInfo.name);
    await sourceParentHandle.removeEntry(sourceInfo.name);

    if (state.activeLibraryFolderId) {
      const frontPagePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
      if (frontPagePath === sourceRelative) {
        const movedPath = destinationPath ? destinationPath + "/" + sourceInfo.name : sourceInfo.name;
        state.frontPageByFolder[state.activeLibraryFolderId] = movedPath;
        saveFrontPageMap();
      }
    }

    clearCurrentSelection();
    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    setStatus("Moved file to " + formatRelativePath(destinationPath));
  } catch (error) {
    console.error(error);
    setStatus("Unable to move file.");
  }
}

async function moveFolder(sourcePath, destinationPath) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  try {
    const sourceRelative = removeRootPrefix(sourcePath);
    const sourceInfo = splitParentAndName(sourceRelative);

    if (!sourceInfo.parentPath && !destinationPath) {
      setStatus("Root folder cannot be moved.");
      return;
    }

    const destinationIsSelf = destinationPath === sourceRelative;
    const destinationInsideSource = destinationPath.startsWith(sourceRelative + "/");
    if (destinationIsSelf || destinationInsideSource) {
      setStatus("Cannot move a folder into itself or its subfolder.");
      return;
    }

    if (sourceInfo.parentPath === destinationPath) {
      setStatus("Source and destination are the same folder.");
      return;
    }

    const sourceParentHandle = await getDirectoryHandleByRelativePath(sourceInfo.parentPath);
    const sourceDirHandle = await sourceParentHandle.getDirectoryHandle(sourceInfo.name);
    const destinationHandle = await getDirectoryHandleByRelativePath(destinationPath);

    const alreadyExists = await directoryExistsInDirectory(destinationHandle, sourceInfo.name);
    if (alreadyExists) {
      setStatus("Destination already has a folder named " + sourceInfo.name + ".");
      return;
    }

    const targetDir = await destinationHandle.getDirectoryHandle(sourceInfo.name, { create: true });
    await copyDirectoryContents(sourceDirHandle, targetDir);
    await sourceParentHandle.removeEntry(sourceInfo.name, { recursive: true });

    if (state.activeLibraryFolderId) {
      const frontPagePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
      if (frontPagePath === sourceRelative || frontPagePath.startsWith(sourceRelative + "/")) {
        const destinationRoot = destinationPath ? destinationPath + "/" + sourceInfo.name : sourceInfo.name;
        const suffix = frontPagePath.slice(sourceRelative.length);
        state.frontPageByFolder[state.activeLibraryFolderId] = destinationRoot + suffix;
        saveFrontPageMap();
      }
    }

    clearCurrentSelection();
    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    setStatus("Moved folder to " + formatRelativePath(destinationPath));
  } catch (error) {
    console.error(error);
    setStatus("Unable to move folder.");
  }
}

function attachDragSource(element, payload) {
  element.addEventListener("dragstart", (event) => {
    state.dragSourcePath = payload.sourcePath;
    state.dragSourceKind = payload.kind;
    element.classList.add("is-dragging");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", JSON.stringify(payload));
    }

    setStatus("Dragging " + payload.sourcePath);
  });

  element.addEventListener("dragend", () => {
    state.dragSourcePath = "";
    state.dragSourceKind = "";
    clearDropHighlights();
    element.classList.remove("is-dragging");
  });
}

function attachDropTarget(element, destinationRelativePath) {
  if (!element) {
    return;
  }

  element.classList.add("drop-target");
  element.dataset.dropPath = destinationRelativePath;

  if (element.dataset.dropBound === "true") {
    return;
  }

  element.dataset.dropBound = "true";

  element.addEventListener("dragover", (event) => {
    if (!state.dragSourcePath) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  });

  element.addEventListener("dragenter", (event) => {
    if (!state.dragSourcePath) {
      return;
    }
    event.preventDefault();
    element.classList.add("is-drop-active");
  });

  element.addEventListener("dragleave", (event) => {
    if (!element.contains(event.relatedTarget)) {
      element.classList.remove("is-drop-active");
    }
  });

  element.addEventListener("drop", (event) => {
    if (!state.dragSourcePath) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const payload = extractDragPayload(event);
    element.classList.remove("is-drop-active");

    if (!payload) {
      setStatus("Drop data was invalid.");
      return;
    }

    const destinationPath = element.dataset.dropPath || "";

    if (payload.kind === "file") {
      void moveFile(payload.sourcePath, destinationPath);
      return;
    }

    if (payload.kind === "folder") {
      void moveFolder(payload.sourcePath, destinationPath);
      return;
    }
  });
}

function extractDragPayload(event) {
  try {
    if (!event.dataTransfer) {
      return null;
    }

    const raw = event.dataTransfer.getData("text/plain");
    if (!raw) {
      if (!state.dragSourcePath || !state.dragSourceKind) {
        return null;
      }

      return {
        sourcePath: state.dragSourcePath,
        kind: state.dragSourceKind
      };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.sourcePath || !parsed.kind) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearDropHighlights() {
  const activeTargets = document.querySelectorAll(".is-drop-active");
  activeTargets.forEach((target) => target.classList.remove("is-drop-active"));
}

function clearCurrentSelection() {
  if (state.currentFileButton) {
    state.currentFileButton.classList.remove("is-active");
  }

  state.currentFileButton = null;
  state.currentFileHandle = null;
  state.currentFilePath = "";
  filePathLabel.textContent = "No file opened";
  editor.value = "";
  revokeImageCache();
  renderPreview("");
  saveBtn.disabled = true;
  insertImageBtn.disabled = true;
}

function removeRootPrefix(fullPath) {
  if (!state.rootHandle) {
    return fullPath;
  }

  if (fullPath === state.rootHandle.name) {
    return "";
  }

  const prefix = state.rootHandle.name + "/";
  if (fullPath.startsWith(prefix)) {
    return fullPath.slice(prefix.length);
  }
  return fullPath;
}

function splitParentAndName(relativePath) {
  const parts = relativePath.split("/");
  const name = parts.pop();
  return {
    parentPath: parts.join("/"),
    name
  };
}

function formatRelativePath(relativePath) {
  if (!relativePath) {
    return "/";
  }
  return "/" + relativePath;
}

async function getDirectoryHandleByRelativePath(relativePath) {
  if (!relativePath) {
    return state.rootHandle;
  }

  const parts = relativePath.split("/").filter(Boolean);
  let current = state.rootHandle;

  for (const part of parts) {
    current = await current.getDirectoryHandle(part);
  }

  return current;
}

async function getFileHandleByRelativePath(relativePath) {
  const sourceInfo = splitParentAndName(relativePath);
  const parentHandle = await getDirectoryHandleByRelativePath(sourceInfo.parentPath);
  return parentHandle.getFileHandle(sourceInfo.name);
}

async function ensureTrashDirectory() {
  return state.rootHandle.getDirectoryHandle(TRASH_DIR_NAME, { create: true });
}

function getTimestampSuffix() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ];
  return parts.join("");
}

async function getUniqueEntryName(targetDirHandle, originalName) {
  const dotIndex = originalName.lastIndexOf(".");
  const hasExtension = dotIndex > 0;
  const baseName = hasExtension ? originalName.slice(0, dotIndex) : originalName;
  const extension = hasExtension ? originalName.slice(dotIndex) : "";

  let candidate = originalName;
  let counter = 0;

  while (true) {
    const fileExists = await fileExistsInDirectory(targetDirHandle, candidate);
    const dirExists = await directoryExistsInDirectory(targetDirHandle, candidate);
    if (!fileExists && !dirExists) {
      return candidate;
    }

    counter += 1;
    const suffix = "-" + getTimestampSuffix() + "-" + counter;
    candidate = baseName + suffix + extension;
  }
}

async function moveFileToTrash(sourceRelativePath) {
  const sourceInfo = splitParentAndName(sourceRelativePath);
  if (sourceInfo.parentPath === TRASH_DIR_NAME) {
    throw new Error("File is already in Trash.");
  }

  const sourceParentHandle = await getDirectoryHandleByRelativePath(sourceInfo.parentPath);
  const sourceFileHandle = await sourceParentHandle.getFileHandle(sourceInfo.name);
  const trashHandle = await ensureTrashDirectory();
  const targetName = await getUniqueEntryName(trashHandle, sourceInfo.name);

  await copyFileToDirectory(sourceFileHandle, trashHandle, targetName);
  await sourceParentHandle.removeEntry(sourceInfo.name);
  return targetName;
}

async function moveFolderToTrash(sourceRelativePath) {
  const sourceInfo = splitParentAndName(sourceRelativePath);
  if (sourceInfo.name === TRASH_DIR_NAME || sourceInfo.parentPath === TRASH_DIR_NAME) {
    throw new Error("Folder is already in Trash.");
  }

  const sourceParentHandle = await getDirectoryHandleByRelativePath(sourceInfo.parentPath);
  const sourceDirHandle = await sourceParentHandle.getDirectoryHandle(sourceInfo.name);
  const trashHandle = await ensureTrashDirectory();
  const targetName = await getUniqueEntryName(trashHandle, sourceInfo.name);
  const targetDir = await trashHandle.getDirectoryHandle(targetName, { create: true });

  await copyDirectoryContents(sourceDirHandle, targetDir);
  await sourceParentHandle.removeEntry(sourceInfo.name, { recursive: true });
  return targetName;
}

function isPathInTrash(relativePath) {
  return relativePath === TRASH_DIR_NAME || relativePath.startsWith(TRASH_DIR_NAME + "/");
}

function isDirectTrashChild(relativePath) {
  const sourceInfo = splitParentAndName(relativePath);
  return sourceInfo.parentPath === TRASH_DIR_NAME;
}

async function restoreFromTrash(sourcePath, kind) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  try {
    const sourceRelative = removeRootPrefix(sourcePath);
    if (!isDirectTrashChild(sourceRelative)) {
      setStatus("Only items directly inside Trash can be restored.");
      return;
    }

    const sourceInfo = splitParentAndName(sourceRelative);
    const trashHandle = await ensureTrashDirectory();
    const restoredName = await getUniqueEntryName(state.rootHandle, sourceInfo.name);

    if (kind === "file") {
      const fileHandle = await trashHandle.getFileHandle(sourceInfo.name);
      await copyFileToDirectory(fileHandle, state.rootHandle, restoredName);
      await trashHandle.removeEntry(sourceInfo.name);
      setStatus("Restored file from Trash: " + restoredName);
    } else {
      const dirHandle = await trashHandle.getDirectoryHandle(sourceInfo.name);
      const targetDir = await state.rootHandle.getDirectoryHandle(restoredName, { create: true });
      await copyDirectoryContents(dirHandle, targetDir);
      await trashHandle.removeEntry(sourceInfo.name, { recursive: true });
      setStatus("Restored folder from Trash: " + restoredName);
    }

    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
  } catch (error) {
    console.error(error);
    setStatus("Unable to restore item from Trash.");
  }
}

function loadFrontPageMap() {
  try {
    const raw = localStorage.getItem(FRONT_PAGE_MAP_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

function saveFrontPageMap() {
  localStorage.setItem(FRONT_PAGE_MAP_KEY, JSON.stringify(state.frontPageByFolder));
}

function setFrontPageForActiveFolder(fullPath) {
  if (!state.activeLibraryFolderId || !state.rootHandle) {
    setStatus("Open a library folder first.");
    return;
  }

  const relativePath = removeRootPrefix(fullPath);
  if (!relativePath) {
    setStatus("Front page must be a file.");
    return;
  }

  state.frontPageByFolder[state.activeLibraryFolderId] = relativePath;
  saveFrontPageMap();
  setStatus("Set front page to " + relativePath);
}

function clearFrontPageForActiveFolder() {
  if (!state.activeLibraryFolderId) {
    return;
  }

  delete state.frontPageByFolder[state.activeLibraryFolderId];
  saveFrontPageMap();
}

async function tryOpenFrontPageForActiveFolder() {
  if (!state.activeLibraryFolderId || !state.rootHandle) {
    return;
  }

  const frontPageRelativePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
  if (!frontPageRelativePath) {
    return;
  }

  try {
    const fileHandle = await getFileHandleByRelativePath(frontPageRelativePath);
    const fullPath = state.rootHandle.name + "/" + frontPageRelativePath;
    const sourceInfo = splitParentAndName(frontPageRelativePath);
    const parentFullPath = sourceInfo.parentPath ? state.rootHandle.name + "/" + sourceInfo.parentPath : state.rootHandle.name;
    setExplorerSelection("file", fullPath, parentFullPath);
    await openMarkdownFile(fileHandle, fullPath, findFileButtonByPath(fullPath));
    setStatus("Opened front page " + frontPageRelativePath + ".");
  } catch {
    clearFrontPageForActiveFolder();
    setStatus("Saved front page no longer exists in this folder.");
  }
}

function findFileButtonByPath(fullPath) {
  const fileButtons = treeRoot.querySelectorAll(".file-button");
  for (const button of fileButtons) {
    if (button.dataset.entryPath === fullPath) {
      return button;
    }
  }
  return null;
}

async function fileExistsInDirectory(dirHandle, fileName) {
  try {
    await dirHandle.getFileHandle(fileName);
    return true;
  } catch {
    return false;
  }
}

async function directoryExistsInDirectory(dirHandle, directoryName) {
  try {
    await dirHandle.getDirectoryHandle(directoryName);
    return true;
  } catch {
    return false;
  }
}

async function copyFileToDirectory(fileHandle, destinationDirHandle, fileName) {
  const file = await fileHandle.getFile();
  const destinationFile = await destinationDirHandle.getFileHandle(fileName, { create: true });
  const writable = await destinationFile.createWritable();
  await writable.write(await file.arrayBuffer());
  await writable.close();
}

async function copyDirectoryContents(sourceDirHandle, destinationDirHandle) {
  for await (const [name, handle] of sourceDirHandle.entries()) {
    if (handle.kind === "file") {
      await copyFileToDirectory(handle, destinationDirHandle, name);
      continue;
    }

    const nestedDest = await destinationDirHandle.getDirectoryHandle(name, { create: true });
    await copyDirectoryContents(handle, nestedDest);
  }
}

function renderPreview(markdownText) {
  preview.innerHTML = markdownToHtml(markdownText);
}

function markdownToHtml(markdownText) {
  const escaped = escapeHtml(markdownText);
  const codeBlocks = [];

  const withoutCode = escaped.replace(/```([\s\S]*?)```/g, (_, block) => {
    const key = "__CODE_BLOCK_" + codeBlocks.length + "__";
    codeBlocks.push("<pre><code>" + block.trim() + "</code></pre>");
    return key;
  });

  const lines = withoutCode.split(/\r?\n/);
  const html = [];

  let inUl = false;
  let inOl = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      const level = headingMatch[1].length;
      html.push("<h" + level + ">" + inlineMarkdown(headingMatch[2]) + "</h" + level + ">");
      continue;
    }

    if (/^(-|\*|\+)\s+/.test(trimmed)) {
      if (!inUl) {
        if (inOl) {
          html.push("</ol>");
          inOl = false;
        }
        html.push("<ul>");
        inUl = true;
      }
      html.push("<li>" + inlineMarkdown(trimmed.replace(/^(-|\*|\+)\s+/, "")) + "</li>");
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inOl) {
        if (inUl) {
          html.push("</ul>");
          inUl = false;
        }
        html.push("<ol>");
        inOl = true;
      }
      html.push("<li>" + inlineMarkdown(trimmed.replace(/^\d+\.\s+/, "")) + "</li>");
      continue;
    }

    if (trimmed.startsWith("> ")) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      html.push("<blockquote>" + inlineMarkdown(trimmed.slice(2)) + "</blockquote>");
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      html.push("<hr />");
      continue;
    }

    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }

    html.push("<p>" + inlineMarkdown(trimmed) + "</p>");
  }

  if (inUl) {
    html.push("</ul>");
  }
  if (inOl) {
    html.push("</ol>");
  }

  let rendered = html.join("\n");
  codeBlocks.forEach((codeHtml, index) => {
    const key = "__CODE_BLOCK_" + index + "__";
    rendered = rendered.replace(key, codeHtml);
  });

  return rendered;
}

function inlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      const resolved = resolveImageUrl(url);
      return `<img src="${resolved}" alt="${alt}" style="max-width:100%;height:auto;border-radius:0.5rem;display:block;margin:0.5em 0">`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function resolveImageUrl(url) {
  if (/^\.\/images\/(.+)/.test(url)) {
    const filename = url.slice("./images/".length);
    if (state.imageCache[filename]) {
      return state.imageCache[filename];
    }
  }
  return url;
}

// ─── Image drag-and-drop on editor ───────────────────────────────────────────

function isImageDrop(event) {
  if (state.dragSourcePath) return false;
  const types = Array.from(event.dataTransfer?.types || []);
  if (!types.includes("Files")) return false;
  const items = Array.from(event.dataTransfer?.items || []);
  return items.some((item) => item.kind === "file" && item.type.startsWith("image/"));
}

function onEditorDragOver(event) {
  if (!isImageDrop(event)) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  editorDropZone.classList.add("is-image-drop-active");
}

function onEditorDragLeave(event) {
  if (!editorDropZone.contains(event.relatedTarget)) {
    editorDropZone.classList.remove("is-image-drop-active");
  }
}

async function onEditorDrop(event) {
  editorDropZone.classList.remove("is-image-drop-active");
  if (state.dragSourcePath) return;
  const files = Array.from(event.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
  if (!files.length) return;
  event.preventDefault();
  event.stopPropagation();

  if (!state.currentFileHandle) {
    setStatus("Open a Markdown file before dropping images.");
    return;
  }

  for (const file of files) {
    await insertImageToNote(file);
  }
}

// ─── Insert Image button ──────────────────────────────────────────────────────

async function onInsertImageClick() {
  if (!state.currentFileHandle) {
    setStatus("Open a file first.");
    return;
  }

  if (window.showOpenFilePicker) {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Images",
            accept: {
              "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".bmp"]
            }
          }
        ],
        multiple: false
      });
      const file = await fileHandle.getFile();
      await insertImageToNote(file);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error(error);
      setStatus("Unable to insert image.");
    }
    return;
  }

  // Fallback: hidden file input
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async () => {
    if (!input.files?.length) return;
    await insertImageToNote(input.files[0]);
  };
  input.click();
}

// ─── Core image insert logic ──────────────────────────────────────────────────

async function insertImageToNote(file) {
  try {
    const imagesDir = await ensureImagesDirForCurrentFile();
    const safeName = sanitizeFileName(file.name);
    const uniqueName = await getUniqueEntryName(imagesDir, safeName);

    // Write image to the images/ folder
    const destHandle = await imagesDir.getFileHandle(uniqueName, { create: true });
    const arrayBuffer = await file.arrayBuffer();
    const writable = await destHandle.createWritable();
    await writable.write(arrayBuffer);
    await writable.close();

    // Update blob cache so preview renders immediately
    if (state.imageCache[uniqueName]) {
      URL.revokeObjectURL(state.imageCache[uniqueName]);
    }
    const blob = new Blob([arrayBuffer], { type: file.type });
    state.imageCache[uniqueName] = URL.createObjectURL(blob);

    // Insert markdown at cursor position
    const markdownRef = `./images/${uniqueName}`;
    const insertion = `![${uniqueName}](${markdownRef})`;
    insertAtCursor(editor, insertion);

    // Trigger input event so preview re-renders
    editor.dispatchEvent(new Event("input"));
    setStatus(`Image inserted: ${uniqueName}`);
  } catch (error) {
    console.error(error);
    setStatus("Unable to insert image.");
  }
}

async function ensureImagesDirForCurrentFile() {
  if (!state.currentFilePath || !state.rootHandle) {
    throw new Error("No file is currently open.");
  }

  const relativePath = removeRootPrefix(state.currentFilePath);
  const parentInfo = splitParentAndName(relativePath);
  const parentDir = await getDirectoryHandleByRelativePath(parentInfo.parentPath);
  return parentDir.getDirectoryHandle("images", { create: true });
}

function sanitizeFileName(name) {
  // Keep extension, replace unsafe chars in base name
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
  const newPos = start + text.length;
  textarea.setSelectionRange(newPos, newPos);
  textarea.focus();
}

// ─── Blob URL cache for preview ───────────────────────────────────────────────

async function updateImageBlobCache() {
  revokeImageCache();

  if (!state.currentFilePath || !state.rootHandle) return;

  try {
    const relativePath = removeRootPrefix(state.currentFilePath);
    const parentInfo = splitParentAndName(relativePath);
    const parentDir = await getDirectoryHandleByRelativePath(parentInfo.parentPath);

    let imagesDir;
    try {
      imagesDir = await parentDir.getDirectoryHandle("images");
    } catch {
      return; // no images folder yet — that's fine
    }

    for await (const [name, handle] of imagesDir.entries()) {
      if (handle.kind !== "file") continue;
      if (!/\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/i.test(name)) continue;
      const file = await handle.getFile();
      state.imageCache[name] = URL.createObjectURL(file);
    }
  } catch (error) {
    console.error("Failed to build image cache:", error);
  }
}

function revokeImageCache() {
  for (const url of Object.values(state.imageCache)) {
    URL.revokeObjectURL(url);
  }
  state.imageCache = {};
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

renderPreview("");
