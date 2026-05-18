import { 
  createIcons, 
  BookOpen, 
  Save, 
  SlidersHorizontal, 
  Settings, 
  FolderPlus, 
  X, 
  LayoutDashboard, 
  FolderSearch, 
  FileText, 
  ImagePlus, 
  Columns, 
  Image, 
  FilePlus, 
  Edit3, 
  Trash2, 
  Home, 
  ArchiveRestore, 
  Menu, 
  Sidebar, 
  ShieldAlert, 
  RefreshCw, 
  Folder, 
  File,
  Search,
  Sun,
  Moon,
  Monitor,
  Bold,
  Italic,
  Strikethrough,
  Eye,
  Code,
  Mail,
  Play,
  MessageSquare,
  Library,
  LockOpen,
  Send,
  Minus,
  Lock,
  Globe,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide';

const icons = {
  BookOpen,
  Save,
  SlidersHorizontal,
  Settings,
  FolderPlus,
  X,
  LayoutDashboard,
  FolderSearch,
  FileText,
  ImagePlus,
  Columns,
  Image,
  FilePlus,
  Edit3,
  Trash2,
  Home,
  ArchiveRestore,
  Menu,
  LayoutSidebar: Sidebar,
  ShieldAlert,
  RefreshCw,
  Folder,
  File,
  Search,
  Sun,
  Moon,
  Monitor,
  Bold,
  Italic,
  Strikethrough,
  Eye,
  Code,
  Mail,
  Play,
  MessageSquare,
  Library,
  LockOpen,
  Send,
  Minus,
  Lock,
  Globe,
  ExternalLink,
  ChevronDown,
  Sparkles
};

class MockDirectoryHandle {
  constructor(name, children = []) {
    this.kind = "directory";
    this.name = name;
    this.children = children;
  }
  async *entries() {
    for (const child of this.children) {
      yield [child.name, child];
    }
  }
  async queryPermission() {
    return "granted";
  }
  async requestPermission() {
    return "granted";
  }
  async getDirectoryHandle(name, options = {}) {
    let dir = this.children.find(c => c.kind === "directory" && c.name === name);
    if (!dir) {
      if (options.create) {
        dir = new MockDirectoryHandle(name);
        this.children.push(dir);
      } else {
        throw new Error(`Directory not found: ${name}`);
      }
    }
    return dir;
  }
  async getFileHandle(name, options = {}) {
    let file = this.children.find(c => c.kind === "file" && c.name === name);
    if (!file) {
      if (options.create) {
        file = new MockFileHandle(name);
        this.children.push(file);
      } else {
        throw new Error(`File not found: ${name}`);
      }
    }
    return file;
  }
  async removeEntry(name, options = {}) {
    const idx = this.children.findIndex(c => c.name === name);
    if (idx !== -1) {
      this.children.splice(idx, 1);
    }
  }
}

class MockFileHandle {
  constructor(name) {
    this.kind = "file";
    this.name = name;
  }
  async queryPermission() {
    return "granted";
  }
  async requestPermission() {
    return "granted";
  }
  async getFile() {
    return new window.File(["# " + this.name.replace(".md", "") + "\n\nThis is a mock markdown file for visual and interactive testing in Clio Notes. You can edit this file, save it, and toggle preview mode! 🎉"], this.name, {
      type: "text/markdown",
      lastModified: Date.now()
    });
  }
  async createWritable() {
    return {
      write: async (content) => {
        console.log(`[Mock Save] Wrote content to ${this.name}:`, content);
      },
      close: async () => {
        console.log(`[Mock Save] Closed writable for ${this.name}`);
      }
    };
  }
}

function setupMockLibrary() {
  const mockPersonalHandle = new MockDirectoryHandle("Personal", [
    new MockDirectoryHandle("Work Notes", [
      new MockFileHandle("Project Clio.md"),
      new MockFileHandle("Aesthetics.md")
    ]),
    new MockDirectoryHandle("Personal Journal", [
      new MockFileHandle("Day 1.md"),
      new MockFileHandle("Reflections.md")
    ]),
    new MockFileHandle("Todo.md")
  ]);

  state.libraryFolders = [
    {
      id: "mock-personal",
      name: "Personal",
      handle: mockPersonalHandle
    }
  ];
  state.activeLibraryFolderId = "mock-personal";
  state.rootHandle = mockPersonalHandle;
  
  state.expandedFolders = new Set();
  
  void refreshTree();
}

const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const addLibraryFolderBtn = document.getElementById("add-library-folder-btn");
const libraryList = document.getElementById("library-list");
const homepageToggle = document.getElementById("homepage-toggle");
const applyHomepageBtn = document.getElementById("apply-homepage-btn");
const themeLightBtn = document.getElementById("theme-light-btn");
const themeDarkBtn = document.getElementById("theme-dark-btn");
const themeSystemBtn = document.getElementById("theme-system-btn");
const homepageUrlLabel = document.getElementById("homepage-url");
const saveBtn = document.getElementById("toolbar-save-btn");
const newFileBtn = document.getElementById("toolbar-new-file-btn");
const insertImageBtn = document.getElementById("toolbar-insert-image-btn");
const togglePreviewBtn = document.getElementById("toolbar-toggle-preview-btn");
const boldBtn = document.getElementById("toolbar-bold-btn");
const italicBtn = document.getElementById("toolbar-italic-btn");
const strikethroughBtn = document.getElementById("toolbar-strikethrough-btn");
const explorer = document.querySelector(".explorer");
const treeRoot = document.getElementById("tree-root");
const folderName = document.getElementById("folder-name");
const explorerHead = document.querySelector(".explorer-head");
const filePathLabel = document.getElementById("file-path");
const statusLabel = document.getElementById("status");
const editor = document.getElementById("editor");
const editorDropZone = document.getElementById("editor-drop-zone");
const preview = document.getElementById("preview");
const panes = document.querySelector(".panes");
const previewPane = document.querySelector(".preview-pane");
const editorToolbar = document.querySelector(".editor-toolbar");
const noNotesPlaceholder = document.getElementById("no-notes-placeholder");
const contextMenu = document.getElementById("context-menu");
const contextMenuItems = Array.from(contextMenu.querySelectorAll(".context-menu-item"));
const activityExplorerBtn = document.getElementById("activity-explorer-btn");
const activitySearchBtn = document.getElementById("activity-search-btn");
const mainContent = document.getElementById("main-content");
const tabBar = document.getElementById("tab-bar");
const privacyScreen = document.getElementById("privacy-screen");
const privacyClock = document.getElementById("privacy-clock");
const privacyDate = document.getElementById("privacy-date");
const privacyShortcuts = document.getElementById("privacy-shortcuts");
const privacySearchForm = document.getElementById("privacy-search-form");
const privacySearchInput = document.getElementById("privacy-search-input");
const privacyHubSearchTab = document.getElementById("privacy-hub-search-tab");
const privacyHubNoteTab = document.getElementById("privacy-hub-note-tab");
const privacyHubSearchPane = document.getElementById("privacy-hub-search-pane");
const privacyHubNotePane = document.getElementById("privacy-hub-note-pane");
const privacyNoteInput = document.getElementById("privacy-note-input");
const privacyNoteSaveBtn = document.getElementById("privacy-note-save-btn");

const privacyUnlockBtn = document.getElementById("privacy-unlock-btn");
const privacyEnabledToggle = document.getElementById("privacy-enabled-toggle");
const privacyTimeoutInput = document.getElementById("privacy-timeout-input");
const privacySearchEngineCbs = document.querySelectorAll(".privacy-search-engine-cb");
const privacyAiSelect = document.getElementById("privacy-ai-engine");
const privacyPasswordSetup = document.getElementById("privacy-password-setup");
const privacyLinksSetup = document.getElementById("privacy-links-setup");
const privacyTimezoneSelect = document.getElementById("privacy-timezone-select");
const privacyLockTrigger = document.getElementById("privacy-lock-trigger");
const privacyAuthContainer = document.getElementById("privacy-auth-container");
const privacyAuthForm = document.getElementById("privacy-auth-form");
const privacyAuthInput = document.getElementById("privacy-auth-input");
const privacyAuthError = document.getElementById("privacy-auth-error");
const privacyAuthCancel = document.getElementById("privacy-auth-cancel");
const explorerSidebar = document.getElementById("explorer-sidebar");
const searchSidebar = document.getElementById("search-sidebar");
const globalSearchInput = document.getElementById("global-search-input");
const searchResultsContainer = document.getElementById("search-results");

const LIBRARY_DB_NAME = "clio-notes-db";
const LIBRARY_DB_VERSION = 1;
const LIBRARY_STORE_NAME = "libraryFolders";
const ACTIVE_LIBRARY_KEY = "clio-notes-active-library-folder-id";
const FRONT_PAGE_MAP_KEY = "clio-notes-front-page-by-folder";
const TRASH_DIR_NAME = ".clio-trash";
const HOMEPAGE_ENABLED_KEY = "clio-notes-homepage-enabled";
const EXPANDED_FOLDERS_KEY = "clio-notes-expanded-folders";
const EXPLORER_VISIBLE_KEY = "clio-notes-explorer-visible";
const OPEN_TABS_KEY = "clio-notes-open-tabs";
const ACTIVE_TAB_KEY = "clio-notes-active-tab";
const THEME_KEY = "clio-notes-theme";
const PRIVACY_ENABLED_KEY = "clio-notes-privacy-enabled";
const PRIVACY_TIMEOUT_KEY = "clio-notes-privacy-timeout";
const PRIVACY_SEARCH_KEY = "clio-notes-privacy-search";
const PRIVACY_AI_KEY = "clio-notes-privacy-ai";
const PRIVACY_PASSWORD_KEY = "clio-notes-privacy-password";
const PRIVACY_LINKS_KEY = "clio-notes-privacy-links";
const PRIVACY_TIMEZONE_KEY = "clio-notes-privacy-timezone";

const state = {
  libraryFolders: [],
  activeLibraryFolderId: "",
  rootHandle: null,
  currentFileHandle: null,
  currentFilePath: "",
  currentFileButton: null,
  dragSourcePath: "",
  dragSourceKind: "",
  previewVisible: false,
  explorerSelectionKind: "",
  explorerSelectionPath: "",
  explorerSelectionParentPath: "",
  settingsOpen: false,
  homepageEnabled: false,
  contextMenuTargetKind: "",
  contextMenuTargetPath: "",
  contextMenuParentPath: "",
  frontPageByFolder: {},
  imageCache: {},
  expandedFolders: new Set(),
  explorerVisible: true,
  tabs: [],
  activeTabId: null,
  theme: "system",
  privacyEnabled: false,
  privacyTimeout: 5,
  privacySearchEngines: ["https://www.google.com/search?q="],
  privacyAiEngine: "https://gemini.google.com/app",
  privacyPassword: "",
  privacyLinks: "https://github.com\nhttps://gmail.com\nhttps://youtube.com\nhttps://twitter.com",
  privacyTimezone: "auto",
  privacyActive: false,
  lastActivity: Date.now()
};

settingsBtn.addEventListener("click", toggleSettingsPanel);
closeSettingsBtn.addEventListener("click", () => setSettingsPanelOpen(false));
settingsPanel.addEventListener("click", (e) => {
  if (e.target === settingsPanel) setSettingsPanelOpen(false);
});
addLibraryFolderBtn.addEventListener("click", () => {
  void addFolderToLibrary();
});

void initializePrivacyScreen();
void initializeFloatingAi();

// ─── Sidebar Switching ───────────────────────────────────────────────────────

function setSidebar(tab) {
  if (tab === "explorer") {
    explorerSidebar.hidden = false;
    searchSidebar.hidden = true;
    activityExplorerBtn.classList.add("text-[var(--color-accent)]", "bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "border", "border-[var(--color-border)]");
    activityExplorerBtn.classList.remove("text-zinc-500", "hover:bg-zinc-100", "dark:hover:bg-zinc-800/60");
    activitySearchBtn.classList.remove("text-[var(--color-accent)]", "bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "border", "border-[var(--color-border)]");
    activitySearchBtn.classList.add("text-zinc-500", "hover:bg-zinc-100", "dark:hover:bg-zinc-800/60");
  } else {
    explorerSidebar.hidden = true;
    searchSidebar.hidden = false;
    activitySearchBtn.classList.add("text-[var(--color-accent)]", "bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "border", "border-[var(--color-border)]");
    activitySearchBtn.classList.remove("text-zinc-500", "hover:bg-zinc-100", "dark:hover:bg-zinc-800/60");
    activityExplorerBtn.classList.remove("text-[var(--color-accent)]", "bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "border", "border-[var(--color-border)]");
    activityExplorerBtn.classList.add("text-zinc-500", "hover:bg-zinc-100", "dark:hover:bg-zinc-800/60");
    globalSearchInput.focus();
  }
}

activityExplorerBtn.addEventListener("click", () => setSidebar("explorer"));
activitySearchBtn.addEventListener("click", () => setSidebar("search"));

// ─── Global Search ───────────────────────────────────────────────────────────

let searchDebounceTimer;
globalSearchInput.addEventListener("input", (e) => {
  clearTimeout(searchDebounceTimer);
  const query = e.target.value.trim().toLowerCase();
  if (!query) {
    searchResultsContainer.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center gap-3 text-zinc-400 p-4"><i data-lucide="search" class="w-10 h-10 opacity-20"></i><p class="text-xs">Search across all your library folders for filenames and content.</p></div>`;
    createIcons({ icons, root: searchResultsContainer });
    return;
  }
  searchDebounceTimer = setTimeout(() => performGlobalSearch(query), 300);
});

async function performGlobalSearch(query) {
  searchResultsContainer.innerHTML = `<div class="flex items-center justify-center p-8"><div class="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div></div>`;
  
  const results = [];
  
  for (const lib of state.libraryFolders) {
    await searchFolderRecursively(lib.handle, lib.name, query, results);
  }
  
  renderSearchResults(results, query);
}

async function searchFolderRecursively(handle, path, query, results) {
  for await (const entry of handle.values()) {
    const currentPath = `${path}/${entry.name}`;
    if (entry.kind === "directory") {
      await searchFolderRecursively(entry, currentPath, query, results);
    } else if (entry.name.toLowerCase().endsWith(".md")) {
      const isNameMatch = entry.name.toLowerCase().includes(query);
      let contentMatch = null;
      
      try {
        const file = await entry.getFile();
        const content = await file.text();
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(query);
        
        if (index !== -1) {
          const start = Math.max(0, index - 40);
          const end = Math.min(content.length, index + query.length + 40);
          contentMatch = (start > 0 ? "..." : "") + content.slice(start, end).replace(/\n/g, " ") + (end < content.length ? "..." : "");
        }
      } catch (err) {
        console.error(`Error reading ${currentPath}:`, err);
      }
      
      if (isNameMatch || contentMatch) {
        results.push({
          name: entry.name,
          path: currentPath,
          handle: entry,
          contentMatch
        });
      }
    }
  }
}

function renderSearchResults(results, query) {
  if (results.length === 0) {
    searchResultsContainer.innerHTML = `<div class="p-8 text-center"><p class="text-sm text-zinc-500">No results found for "${query}"</p></div>`;
    return;
  }
  
  searchResultsContainer.innerHTML = "";
  results.forEach(result => {
    const item = document.createElement("div");
    item.className = "p-3.5 mb-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] hover:shadow-refraction transition-all duration-200 cursor-pointer group active:scale-[0.98]";
    
    const highlight = (text, q) => {
      if (!text) return "";
      const regex = new RegExp(`(${q})`, "gi");
      return text.replace(regex, '<mark class="bg-[var(--color-accent-soft)] text-[var(--color-accent)] rounded px-0.5 font-medium">$1</mark>');
    };

    item.innerHTML = `
      <div class="flex items-start gap-3">
        <i data-lucide="file-text" class="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 transition-colors group-hover:text-[var(--color-accent)]"></i>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-[var(--color-accent)] transition-colors">${highlight(result.name, query)}</h3>
          <p class="text-[10px] text-zinc-400 truncate mb-1.5">${result.path}</p>
          ${result.contentMatch ? `<p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 italic">${highlight(result.contentMatch, query)}</p>` : ""}
        </div>
      </div>
    `;
    
    item.addEventListener("click", async () => {
      await openFile(result.handle);
    });
    
    searchResultsContainer.appendChild(item);
  });
  
  createIcons({ icons, root: searchResultsContainer });
}
homepageToggle.addEventListener("change", onHomepageToggleChange);

if (themeLightBtn) themeLightBtn.addEventListener("click", () => setTheme("light"));
if (themeDarkBtn) themeDarkBtn.addEventListener("click", () => setTheme("dark"));
if (themeSystemBtn) themeSystemBtn.addEventListener("click", () => setTheme("system"));

initializeTheme();

applyHomepageBtn.addEventListener("click", () => {
  void applyHomepageSetting();
});
saveBtn.addEventListener("click", saveCurrentFile);
if (newFileBtn) newFileBtn.addEventListener("click", () => void createMarkdownFile());
insertImageBtn.addEventListener("click", () => void onInsertImageClick());
togglePreviewBtn.addEventListener("click", togglePreview);

if (boldBtn) boldBtn.addEventListener("click", () => applyFormatting("**", "**"));
if (italicBtn) italicBtn.addEventListener("click", () => applyFormatting("*", "*"));
if (strikethroughBtn) strikethroughBtn.addEventListener("click", () => applyFormatting("~~", "~~"));
if (activityExplorerBtn) {
  activityExplorerBtn.addEventListener("click", toggleExplorer);
}
if (activitySearchBtn) {
  activitySearchBtn.addEventListener("click", () => {
    setStatus("Search functionality coming soon!");
  });
}
editor.addEventListener("input", () => {
  renderPreview(editor.value);
  const activeTab = state.tabs.find(t => t.path === state.activeTabId);
  if (activeTab && !activeTab.isDirty) {
    activeTab.isDirty = true;
    renderTabs();
  }
});
editorDropZone.addEventListener("dragover", onEditorDragOver);
editorDropZone.addEventListener("dragleave", onEditorDragLeave);
editorDropZone.addEventListener("drop", onEditorDrop);
editor.addEventListener("paste", onEditorPaste);
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

const savedExplorerVisible = localStorage.getItem(EXPLORER_VISIBLE_KEY);
state.explorerVisible = savedExplorerVisible === null ? true : savedExplorerVisible === "true";
updateExplorerVisibility();

createIcons({ icons });
updateWorkspaceVisibility();

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
    const libraryId = folderTarget.dataset.libraryId;
    if (libraryId) void switchActiveLibrary(libraryId);

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

    showContextMenu(event.clientX, event.clientY, ["new-file", "new-folder", "rename", "delete-folder"]);
    return;
  }

  if (fileTarget) {
    const libraryId = fileTarget.dataset.libraryId;
    if (libraryId) void switchActiveLibrary(libraryId);

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

    showContextMenu(event.clientX, event.clientY, ["new-file", "new-folder", "rename", "delete-file", "set-front-page"]);
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

  if (action === "rename" && (targetKind === "file" || targetKind === "folder")) {
    await renameEntry(state.contextMenuTargetPath, targetKind);
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

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
}

function applyTheme() {
  const theme = state.theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
    : state.theme;
  
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  
  updateThemeUI();
}

function updateThemeUI() {
  const buttons = {
    light: themeLightBtn,
    dark: themeDarkBtn,
    system: themeSystemBtn
  };
  
  Object.entries(buttons).forEach(([key, btn]) => {
    if (!btn) return;
    if (state.theme === key) {
      btn.classList.add("bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "text-[var(--color-accent)]", "border", "border-[var(--color-border)]");
    } else {
      btn.classList.remove("bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "text-[var(--color-accent)]", "border", "border-[var(--color-border)]");
    }
  });
}

function initializeTheme() {
  state.theme = localStorage.getItem(THEME_KEY) || "system";
  applyTheme();
  
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (state.theme === "system") {
      applyTheme();
    }
  });
}

async function initializeLibrary() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mock") === "true") {
      setupMockLibrary();
      return;
    }

    const rawExpanded = localStorage.getItem(EXPANDED_FOLDERS_KEY);
    if (rawExpanded) {
      try {
        state.expandedFolders = new Set(JSON.parse(rawExpanded));
      } catch (e) {
        state.expandedFolders = new Set();
      }
    }
    state.frontPageByFolder = loadFrontPageMap();
    state.libraryFolders = await getStoredLibraryFolders();
    renderLibraryList();

    const storedActiveId = localStorage.getItem(ACTIVE_LIBRARY_KEY) || "";
    const activeEntry = state.libraryFolders.find((entry) => entry.id === storedActiveId);
    
    if (activeEntry) {
      state.activeLibraryFolderId = activeEntry.id;
      state.rootHandle = activeEntry.handle;
    } else if (state.libraryFolders.length > 0) {
      // If no active library is stored but we have libraries, pick the first one as active root
      state.activeLibraryFolderId = state.libraryFolders[0].id;
      state.rootHandle = state.libraryFolders[0].handle;
    }

    if (state.libraryFolders.length > 0) {
      await refreshTree();
      await tryOpenFrontPageForActiveFolder();
    } else {
      setStatus("Open Settings > Library and add a folder to get started.");
    }
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
    
    if (state.libraryFolders.length > 0) {
      await switchActiveLibrary(state.libraryFolders[0].id);
    } else {
      state.rootHandle = null;
      clearCurrentSelection();
      folderName.textContent = "No folder selected";
    }
  }

  await refreshTree();
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
  if (newFileBtn) newFileBtn.disabled = false;
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

function togglePreview() {
  state.previewVisible = !state.previewVisible;
  updatePreviewVisibility();
}

function updatePreviewVisibility() {
  if (previewPane) {
    previewPane.classList.toggle("is-hidden", !state.previewVisible);
  }
  const labelSpan = togglePreviewBtn.querySelector("span");
  if (labelSpan) {
    labelSpan.textContent = state.previewVisible ? "Hide Preview" : "Show Preview";
  }
  togglePreviewBtn.setAttribute("aria-pressed", String(!state.previewVisible));
}

function toggleExplorer() {
  state.explorerVisible = !state.explorerVisible;
  localStorage.setItem(EXPLORER_VISIBLE_KEY, String(state.explorerVisible));
  updateExplorerVisibility();
}

function updateExplorerVisibility() {
  if (mainContent) {
    mainContent.classList.toggle("explorer-collapsed", !state.explorerVisible);
  }
  if (activityExplorerBtn) {
    if (state.explorerVisible) {
      activityExplorerBtn.classList.add("text-[var(--color-accent)]", "bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "border", "border-[var(--color-border)]");
      activityExplorerBtn.classList.remove("text-zinc-500", "hover:bg-zinc-100", "dark:hover:bg-zinc-800/60");
    } else {
      activityExplorerBtn.classList.remove("text-[var(--color-accent)]", "bg-[var(--color-surface)]", "dark:bg-zinc-800", "shadow-sm", "border", "border-[var(--color-border)]");
      activityExplorerBtn.classList.add("text-zinc-500", "hover:bg-zinc-100", "dark:hover:bg-zinc-800/60");
    }
  }
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

async function buildFolderTree(dirHandle, pathPrefix, libraryId) {
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

    const folderIcon = document.createElement("i");
    folderIcon.setAttribute("data-lucide", "folder");
    folderIcon.className = "item-icon text-amber-500 w-4 h-4";

    const folderNameText = document.createElement("span");
    folderNameText.className = "item-name";
    folderNameText.textContent = directory.name;

    label.appendChild(folderIcon);
    label.appendChild(folderNameText);

    const folderPath = pathPrefix + "/" + directory.name;
    summary.dataset.entryType = "folder";
    summary.dataset.entryPath = folderPath;
    summary.dataset.parentPath = pathPrefix;
    summary.dataset.libraryId = libraryId;
    
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      void switchActiveLibrary(libraryId);
      setExplorerSelection("folder", folderPath, pathPrefix);
      details.open = !details.open;
    });

    attachDragSource(summary, {
      kind: "folder",
      sourcePath: folderPath
    });

    attachDropTarget(summary, removeRootPrefix(folderPath));

    summaryRow.appendChild(label);
    summary.appendChild(summaryRow);

    details.appendChild(summary);
    
    // Set initial open state
    if (state.expandedFolders && state.expandedFolders.has(folderPath)) {
      details.open = true;
    }
    
    // Listen for toggle to save state
    details.addEventListener("toggle", () => {
      if (!state.expandedFolders) return;
      if (details.open) {
        state.expandedFolders.add(folderPath);
      } else {
        state.expandedFolders.delete(folderPath);
      }
      localStorage.setItem(EXPANDED_FOLDERS_KEY, JSON.stringify(Array.from(state.expandedFolders)));
    });

    details.appendChild(await buildFolderTree(directory.handle, folderPath, libraryId));

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

    const fileIcon = document.createElement("i");
    fileIcon.setAttribute("data-lucide", "file-text");
    fileIcon.className = "item-icon w-4 h-4";

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
    button.dataset.libraryId = libraryId;

    button.addEventListener("click", () => {
      void switchActiveLibrary(libraryId);
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
  if (state.libraryFolders.length === 0) {
    treeRoot.innerHTML = '<p class="muted">Choose a folder from Settings > Library.</p>';
    return;
  }

  treeRoot.innerHTML = "";
  attachDropTarget(explorerHead, "");

  const treeList = document.createElement("ul");
  treeList.className = "tree-root-list";
  treeRoot.appendChild(treeList);

  for (const entry of state.libraryFolders) {
    const rootItem = document.createElement("li");
    rootItem.className = "tree-item library-root";
    treeList.appendChild(rootItem);

    const details = document.createElement("details");
    details.open = true; // Root libraries are open by default
    rootItem.appendChild(details);

    const summary = document.createElement("summary");
    summary.className = "folder-summary library-summary";
    summary.dataset.entryType = "root";
    summary.dataset.entryPath = entry.name;
    summary.dataset.libraryId = entry.id;
    
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      void switchActiveLibrary(entry.id);
      setExplorerSelection("root", entry.name, entry.name);
      details.open = !details.open;
    });

    const summaryRow = document.createElement("span");
    summaryRow.className = "tree-row";

    const label = document.createElement("span");
    label.className = "tree-label";

    const libIcon = document.createElement("i");
    libIcon.setAttribute("data-lucide", "library");
    libIcon.className = "item-icon w-4 h-4";

    const libNameText = document.createElement("span");
    libNameText.className = "item-name font-bold";
    libNameText.textContent = entry.name;

    label.appendChild(libIcon);
    label.appendChild(libNameText);
    summaryRow.appendChild(label);
    summary.appendChild(summaryRow);
    details.appendChild(summary);

    try {
      const hasPermission = await hasReadWritePermission(entry.handle);
      if (hasPermission) {
        const tree = await buildFolderTree(entry.handle, entry.name, entry.id);
        details.appendChild(tree);
      } else {
        const reconnectContainer = document.createElement("div");
        reconnectContainer.className = "p-2 pl-6";
        
        const reconnectBtn = document.createElement("button");
        reconnectBtn.className = "text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 active:scale-95 transition-all duration-200";
        reconnectBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-3 h-3"></i> Reconnect';
        reconnectBtn.onclick = (e) => {
          e.stopPropagation();
          void reconnectLibrary(entry.id);
        };
        reconnectContainer.appendChild(reconnectBtn);
        details.appendChild(reconnectContainer);
      }
    } catch (error) {
      console.error(`Error rendering library ${entry.name}:`, error);
    }
  }

  createIcons({ icons, root: treeRoot });
  updateExplorerActionButtons();
}

async function switchActiveLibrary(libraryId) {
  if (state.activeLibraryFolderId === libraryId) return;

  const entry = state.libraryFolders.find(f => f.id === libraryId);
  if (!entry) return;

  state.activeLibraryFolderId = libraryId;
  state.rootHandle = entry.handle;
  localStorage.setItem(ACTIVE_LIBRARY_KEY, libraryId);
  folderName.textContent = entry.name;
  renderLibraryList();
}

async function reconnectLibrary(libraryId) {
  const entry = state.libraryFolders.find(f => f.id === libraryId);
  if (!entry) return;

  try {
    const hasPermission = await ensureReadWritePermission(entry.handle);
    if (hasPermission) {
      await switchActiveLibrary(libraryId);
      await refreshTree();
      await tryOpenFrontPageForActiveFolder();
    }
  } catch (error) {
    console.error("Reconnection error:", error);
    setStatus("Failed to reconnect library.");
  }
}


async function openMarkdownFile(fileHandle, filePath, clickedButton) {
  try {
    const hasPermission = await ensureReadWritePermission(fileHandle);
    if (!hasPermission) {
      setStatus("Read/write permission was not granted for this file.");
      return;
    }

    // If already open, just switch
    const existingTab = state.tabs.find(t => t.path === filePath);
    if (existingTab) {
      switchTab(filePath);
      return;
    }

    const file = await fileHandle.getFile();
    const text = await file.text();

    const newTab = {
      handle: fileHandle,
      path: filePath,
      content: text,
      isDirty: false
    };

    state.tabs.push(newTab);
    state.activeTabId = filePath;
    
    updateEditorWithTabData(newTab);
    renderTabs();
    saveTabState();
    setStatus("File opened in new tab.");
  } catch (error) {
    console.error(error);
    setStatus("Unable to open selected file.");
  }
}

function updateEditorWithTabData(tab) {
  state.currentFileHandle = tab.handle;
  state.currentFilePath = tab.path;
  
  if (state.currentFileButton) {
    state.currentFileButton.classList.remove("is-active");
  }
  
  const targetButton = findFileButtonByPath(tab.path);
  if (targetButton) {
    targetButton.classList.add("is-active");
    state.currentFileButton = targetButton;
  } else {
    state.currentFileButton = null;
  }

  filePathLabel.textContent = tab.path;
  editor.value = tab.content;
  insertImageBtn.disabled = false;
  saveBtn.disabled = false;
  
  void updateImageBlobCache();
  renderPreview(tab.content);
}

function switchTab(tabId) {
  if (state.activeTabId === tabId) return;

  // Save current editor content to the outgoing tab
  const outgoingTab = state.tabs.find(t => t.path === state.activeTabId);
  if (outgoingTab) {
    outgoingTab.content = editor.value;
  }

  const incomingTab = state.tabs.find(t => t.path === tabId);
  if (!incomingTab) return;

  state.activeTabId = tabId;
  updateEditorWithTabData(incomingTab);
  renderTabs();
  saveTabState();
}

async function closeTab(tabId, event) {
  if (event) {
    event.stopPropagation();
  }

  const tabIndex = state.tabs.findIndex(t => t.path === tabId);
  if (tabIndex === -1) return;

  const tab = state.tabs[tabIndex];
  if (tab.isDirty) {
    if (!window.confirm(`File "${tab.path}" has unsaved changes. Close anyway?`)) {
      return;
    }
  }

  state.tabs.splice(tabIndex, 1);

  if (state.tabs.length === 0) {
    state.activeTabId = null;
    clearEditor();
  } else if (state.activeTabId === tabId) {
    // Switch to adjacent tab
    const nextTabIndex = Math.min(tabIndex, state.tabs.length - 1);
    const nextTab = state.tabs[nextTabIndex];
    state.activeTabId = nextTab.path;
    updateEditorWithTabData(nextTab);
  }

  renderTabs();
  saveTabState();
}

function updateWorkspaceVisibility() {
  const hasTabs = state.tabs.length > 0;
  
  if (hasTabs) {
    if (editorToolbar) {
      editorToolbar.style.removeProperty("display");
      editorToolbar.hidden = false;
    }
    if (panes) {
      panes.style.removeProperty("display");
      panes.hidden = false;
    }
    if (noNotesPlaceholder) {
      noNotesPlaceholder.style.setProperty("display", "none", "important");
      noNotesPlaceholder.hidden = true;
    }
    if (tabBar) {
      tabBar.hidden = false;
    }
  } else {
    if (editorToolbar) {
      editorToolbar.style.setProperty("display", "none", "important");
      editorToolbar.hidden = true;
    }
    if (panes) {
      panes.style.setProperty("display", "none", "important");
      panes.hidden = true;
    }
    if (noNotesPlaceholder) {
      noNotesPlaceholder.style.removeProperty("display");
      noNotesPlaceholder.hidden = false;
    }
    if (tabBar) {
      tabBar.hidden = true;
    }
  }
}

function renderTabs() {
  if (!tabBar) return;

  if (state.tabs.length === 0) {
    tabBar.hidden = true;
    updateWorkspaceVisibility();
    return;
  }

  tabBar.hidden = false;
  tabBar.innerHTML = "";

  state.tabs.forEach(tab => {
    const tabEl = document.createElement("div");
    tabEl.className = "tab" + (state.activeTabId === tab.path ? " is-active" : "");
    tabEl.dataset.path = tab.path;
    
    const info = splitParentAndName(removeRootPrefix(tab.path));
    
    const nameEl = document.createElement("span");
    nameEl.textContent = info.name;
    tabEl.appendChild(nameEl);

    if (tab.isDirty) {
      const dot = document.createElement("span");
      dot.className = "tab-dirty-dot";
      tabEl.appendChild(dot);
    }

    const closeBtn = document.createElement("button");
    closeBtn.className = "tab-close";
    closeBtn.innerHTML = '<i data-lucide="x" class="w-3 h-3"></i>';
    closeBtn.addEventListener("click", (e) => void closeTab(tab.path, e));
    tabEl.appendChild(closeBtn);

    tabEl.addEventListener("click", () => switchTab(tab.path));
    
    tabBar.appendChild(tabEl);
  });

  createIcons({ icons, root: tabBar });
  updateWorkspaceVisibility();
}

function saveTabState() {
  const tabPaths = state.tabs.map(t => t.path);
  localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(tabPaths));
  localStorage.setItem(ACTIVE_TAB_KEY, state.activeTabId || "");
}

function clearEditor() {
  state.currentFileHandle = null;
  state.currentFilePath = "";
  if (state.currentFileButton) {
    state.currentFileButton.classList.remove("is-active");
  }
  state.currentFileButton = null;
  filePathLabel.textContent = "No file opened";
  editor.value = "";
  insertImageBtn.disabled = true;
  saveBtn.disabled = true;
  clearImageBlobCache();
  renderPreview("");
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

async function restoreTabs() {
  const savedPaths = localStorage.getItem(OPEN_TABS_KEY);
  const savedActiveId = localStorage.getItem(ACTIVE_TAB_KEY);
  
  if (!savedPaths) return;
  
  try {
    const paths = JSON.parse(savedPaths);
    for (const path of paths) {
      try {
        const relativePath = removeRootPrefix(path);
        const info = splitParentAndName(relativePath);
        const dirHandle = await getDirectoryHandleByRelativePath(info.parentPath);
        const fileHandle = await dirHandle.getFileHandle(info.name);
        
        const file = await fileHandle.getFile();
        const text = await file.text();
        
        state.tabs.push({
          handle: fileHandle,
          path: path,
          content: text,
          isDirty: false
        });
      } catch (err) {
        console.warn(`Failed to restore tab for ${path}:`, err);
      }
    }
    
    if (state.tabs.length > 0) {
      const activeTab = state.tabs.find(t => t.path === savedActiveId) || state.tabs[0];
      state.activeTabId = activeTab.path;
      updateEditorWithTabData(activeTab);
      renderTabs();
    }
  } catch (err) {
    console.error("Failed to parse saved tabs:", err);
  }
}


async function saveCurrentFile() {
  const activeTab = state.tabs.find(t => t.path === state.activeTabId);
  if (!activeTab) {
    setStatus("Open a file first.");
    return;
  }
  try {
    const writable = await activeTab.handle.createWritable();
    await writable.write(editor.value);
    await writable.close();
    
    activeTab.content = editor.value;
    activeTab.isDirty = false;
    renderTabs();
    
    setStatus("Saved " + activeTab.path);
  } catch (error) {
    console.error(error);
    setStatus("Save failed.");
  }
}

function applyFormatting(prefix, suffix) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  const selected = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  editor.value = before + prefix + selected + suffix + after;
  editor.selectionStart = start + prefix.length;
  editor.selectionEnd = start + prefix.length + selected.length;
  editor.focus();
  
  editor.dispatchEvent(new Event('input'));
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

    const fileHandle = await targetDir.getFileHandle(fileName, { create: true });

    const writable = await fileHandle.createWritable();
    const title = fileName.replace(/\.md$/i, "");
    await writable.write(`# ${title}\n\n`);
    await writable.close();

    await refreshTree();
    setStatus("Created " + fileName + " in " + formatRelativePath(destinationPath));
    const fullPath = destinationPath ? destinationPath + "/" + fileName : fileName;
    await openMarkdownFile(fileHandle, fullPath);
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

async function renameEntry(sourcePath, kind) {
  if (!state.rootHandle) {
    setStatus("Open a folder first.");
    return;
  }

  try {
    const sourceRelative = removeRootPrefix(sourcePath);
    const sourceInfo = splitParentAndName(sourceRelative);
    
    if (sourceRelative === TRASH_DIR_NAME) {
      setStatus("Trash folder cannot be renamed.");
      return;
    }

    const newNameInput = window.prompt("New name:", sourceInfo.name);
    if (newNameInput === null) {
      setStatus("Rename canceled.");
      return;
    }

    const trimmed = newNameInput.trim();
    if (!trimmed) {
      setStatus("Name cannot be empty.");
      return;
    }

    if (trimmed === sourceInfo.name) {
      return; // No change
    }

    if (trimmed.includes("/")) {
      setStatus("Name cannot contain '/'.");
      return;
    }

    const parentHandle = await getDirectoryHandleByRelativePath(sourceInfo.parentPath);
    const alreadyExistsFile = await fileExistsInDirectory(parentHandle, trimmed);
    const alreadyExistsDir = await directoryExistsInDirectory(parentHandle, trimmed);
    if (alreadyExistsFile || alreadyExistsDir) {
      setStatus("An item named " + trimmed + " already exists.");
      return;
    }

    if (kind === "file") {
      const sourceFileHandle = await parentHandle.getFileHandle(sourceInfo.name);
      await copyFileToDirectory(sourceFileHandle, parentHandle, trimmed);
      await parentHandle.removeEntry(sourceInfo.name);
      
      const newRelativePath = sourceInfo.parentPath ? sourceInfo.parentPath + "/" + trimmed : trimmed;
      const newFullPath = state.rootHandle.name + "/" + newRelativePath;
      const newFileHandle = await getFileHandleByRelativePath(newRelativePath);

      // Update tabs if file is open
      state.tabs.forEach(tab => {
        if (tab.path === sourcePath) {
          tab.path = newFullPath;
          tab.handle = newFileHandle;
          if (state.activeTabId === sourcePath) {
            state.activeTabId = newFullPath;
            state.currentFilePath = newFullPath;
            state.currentFileHandle = newFileHandle;
            filePathLabel.textContent = newFullPath;
          }
        }
      });

      if (state.activeLibraryFolderId && (getFrontPageMap()[state.activeLibraryFolderId] || "") === sourceRelative) {
        state.frontPageByFolder[state.activeLibraryFolderId] = newRelativePath;
        saveFrontPageMap();
      }
    } else {
      const sourceDirHandle = await parentHandle.getDirectoryHandle(sourceInfo.name);
      const targetDir = await parentHandle.getDirectoryHandle(trimmed, { create: true });
      await copyDirectoryContents(sourceDirHandle, targetDir);
      await parentHandle.removeEntry(sourceInfo.name, { recursive: true });

      // Update tabs for any file inside this folder
      for (const tab of state.tabs) {
        const tabRelativePath = removeRootPrefix(tab.path);
        if (tabRelativePath === sourceRelative || tabRelativePath.startsWith(sourceRelative + "/")) {
          let newRelativePath;
          if (tabRelativePath === sourceRelative) {
             newRelativePath = (sourceInfo.parentPath ? sourceInfo.parentPath + "/" : "") + trimmed;
          } else {
             const subPath = tabRelativePath.slice(sourceRelative.length);
             newRelativePath = (sourceInfo.parentPath ? sourceInfo.parentPath + "/" : "") + trimmed + subPath;
          }
          
          const newFullPath = state.rootHandle.name + "/" + newRelativePath;
          const oldPath = tab.path;
          
          tab.path = newFullPath;
          tab.handle = await getFileHandleByRelativePath(newRelativePath);
          
          if (state.activeTabId === oldPath) {
            state.activeTabId = newFullPath;
            state.currentFilePath = newFullPath;
            state.currentFileHandle = tab.handle;
            filePathLabel.textContent = newFullPath;
          }
        }
      }

      if (state.activeLibraryFolderId) {
        const frontPagePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
        if (frontPagePath === sourceRelative || frontPagePath.startsWith(sourceRelative + "/")) {
          const destinationRoot = (sourceInfo.parentPath ? sourceInfo.parentPath + "/" : "") + trimmed;
          const suffix = frontPagePath.slice(sourceRelative.length);
          state.frontPageByFolder[state.activeLibraryFolderId] = destinationRoot + suffix;
          saveFrontPageMap();
        }
      }
    }

    await refreshTree();
    renderTabs();
    saveTabState();
    setStatus("Renamed to " + trimmed);
  } catch (error) {
    console.error(error);
    setStatus("Unable to rename.");
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

    // Close tab if deleted file was open
    if (state.tabs.some(t => t.path === sourcePath)) {
      await closeTab(sourcePath);
    }

    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    renderTabs();
    saveTabState();
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
    
    // Close any tabs for files inside this folder
    const tabsToClose = state.tabs.filter(t => {
      const tabRelative = removeRootPrefix(t.path);
      return tabRelative === sourceRelative || tabRelative.startsWith(sourceRelative + "/");
    }).map(t => t.path);

    for (const path of tabsToClose) {
      await closeTab(path);
    }

    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    renderTabs();
    saveTabState();
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

    const newRelativePath = destinationPath ? destinationPath + "/" + sourceInfo.name : sourceInfo.name;
    const newFullPath = state.rootHandle.name + "/" + newRelativePath;
    const newFileHandle = await getFileHandleByRelativePath(newRelativePath);

    // Update tab if file is open
    state.tabs.forEach(tab => {
      if (tab.path === sourcePath) {
        tab.path = newFullPath;
        tab.handle = newFileHandle;
        if (state.activeTabId === sourcePath) {
          state.activeTabId = newFullPath;
          state.currentFilePath = newFullPath;
          state.currentFileHandle = newFileHandle;
          filePathLabel.textContent = newFullPath;
        }
      }
    });

    if (state.activeLibraryFolderId) {
      const frontPagePath = state.frontPageByFolder[state.activeLibraryFolderId] || "";
      if (frontPagePath === sourceRelative) {
        state.frontPageByFolder[state.activeLibraryFolderId] = newRelativePath;
        saveFrontPageMap();
      }
    }

    setExplorerSelection("root", state.rootHandle.name, state.rootHandle.name);
    await refreshTree();
    renderTabs();
    saveTabState();
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

function removeRootPrefix(fullPath) {
  if (!fullPath) return "";
  
  for (const entry of state.libraryFolders) {
    const prefix = entry.name;
    if (fullPath === prefix) return "";
    if (fullPath.startsWith(prefix + "/")) {
      return fullPath.substring(prefix.length + 1);
    }
  }
  
  return fullPath;
}

async function getDirectoryHandleByRelativePath(relativePath) {
  // If relativePath is empty, it means we want the root of the ACTIVE library
  if (!relativePath) {
    return state.rootHandle;
  }

  // Check if relativePath is actually a fullPath starting with a library name
  for (const entry of state.libraryFolders) {
    if (relativePath === entry.name) return entry.handle;
    if (relativePath.startsWith(entry.name + "/")) {
      const actualRelative = relativePath.substring(entry.name.length + 1);
      return await getDirectoryHandleByRootAndRelative(entry.handle, actualRelative);
    }
  }

  // Fallback to active root
  return await getDirectoryHandleByRootAndRelative(state.rootHandle, relativePath);
}

async function getDirectoryHandleByRootAndRelative(rootHandle, relativePath) {
  if (!relativePath) return rootHandle;
  const parts = relativePath.split("/").filter(Boolean);
  let current = rootHandle;

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

async function onEditorPaste(event) {
  const items = Array.from(event.clipboardData?.items || []);
  const imageItems = items.filter((item) => item.kind === "file" && item.type.startsWith("image/"));
  if (!imageItems.length) return;

  // There are images in the clipboard — take over this paste event
  event.preventDefault();

  if (!state.currentFileHandle) {
    setStatus("Open a Markdown file before pasting images.");
    return;
  }

  for (const item of imageItems) {
    const file = item.getAsFile();
    if (file) {
      await insertImageToNote(file);
    }
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

async function initializePrivacyScreen() {
  console.log("Initializing Privacy Screen...", { privacyLockTrigger });
  // Load settings
  state.privacyEnabled = localStorage.getItem(PRIVACY_ENABLED_KEY) === "true";
  state.privacyTimeout = parseInt(localStorage.getItem(PRIVACY_TIMEOUT_KEY) || "5", 10);
  try {
    const stored = localStorage.getItem(PRIVACY_SEARCH_KEY);
    state.privacySearchEngines = stored ? JSON.parse(stored) : ["https://www.google.com/search?q="];
  } catch (e) {
    state.privacySearchEngines = ["https://www.google.com/search?q="];
  }
  state.privacyAiEngine = localStorage.getItem(PRIVACY_AI_KEY) || "https://gemini.google.com/app";
  state.privacyPassword = localStorage.getItem(PRIVACY_PASSWORD_KEY) || "";
  state.privacyLinks = localStorage.getItem(PRIVACY_LINKS_KEY) || "https://github.com\nhttps://gmail.com\nhttps://youtube.com\nhttps://twitter.com";
  state.privacyTimezone = localStorage.getItem(PRIVACY_TIMEZONE_KEY) || "auto";

  // Update UI settings
  if (privacyEnabledToggle) privacyEnabledToggle.checked = state.privacyEnabled;
  if (privacyTimeoutInput) privacyTimeoutInput.value = state.privacyTimeout;
  if (privacySearchEngineCbs.length) {
    privacySearchEngineCbs.forEach(cb => {
      cb.checked = state.privacySearchEngines.includes(cb.value);
    });
  }
  if (privacyAiSelect) privacyAiSelect.value = state.privacyAiEngine;
  if (privacyPasswordSetup) privacyPasswordSetup.value = state.privacyPassword;
  if (privacyLinksSetup) privacyLinksSetup.value = state.privacyLinks;
  if (privacyTimezoneSelect) privacyTimezoneSelect.value = state.privacyTimezone;

  // Listeners for settings
  privacyEnabledToggle?.addEventListener("change", (e) => {
    state.privacyEnabled = e.target.checked;
    localStorage.setItem(PRIVACY_ENABLED_KEY, state.privacyEnabled);
  });
  privacyTimeoutInput?.addEventListener("change", (e) => {
    state.privacyTimeout = parseInt(e.target.value, 10);
    localStorage.setItem(PRIVACY_TIMEOUT_KEY, state.privacyTimeout);
  });
  
  if (privacySearchEngineCbs.length) {
    privacySearchEngineCbs.forEach(cb => {
      cb.addEventListener("change", () => {
        const selected = Array.from(privacySearchEngineCbs)
          .filter(c => c.checked)
          .map(c => c.value);
        
        if (selected.length === 0) {
          cb.checked = true;
          return;
        }
        
        state.privacySearchEngines = selected;
        localStorage.setItem(PRIVACY_SEARCH_KEY, JSON.stringify(state.privacySearchEngines));
      });
    });
  }
  privacyAiSelect?.addEventListener("change", (e) => {
    state.privacyAiEngine = e.target.value;
    localStorage.setItem(PRIVACY_AI_KEY, state.privacyAiEngine);
  });
  privacyPasswordSetup?.addEventListener("change", (e) => {
    state.privacyPassword = e.target.value;
    localStorage.setItem(PRIVACY_PASSWORD_KEY, state.privacyPassword);
  });
  privacyLinksSetup?.addEventListener("change", (e) => {
    state.privacyLinks = e.target.value;
    localStorage.setItem(PRIVACY_LINKS_KEY, state.privacyLinks);
  });
  privacyTimezoneSelect?.addEventListener("change", (e) => {
    state.privacyTimezone = e.target.value;
    localStorage.setItem(PRIVACY_TIMEZONE_KEY, state.privacyTimezone);
    updatePrivacyClock(); // Immediate update
  });

  // Activity listeners
  const resetActivity = () => {
    state.lastActivity = Date.now();
  };

  window.addEventListener("mousemove", resetActivity);
  window.addEventListener("keydown", resetActivity);
  window.addEventListener("mousedown", resetActivity);
  window.addEventListener("touchstart", resetActivity);

  // Search logic
  privacySearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = privacySearchInput.value.trim();
    if (query && state.privacySearchEngines.length > 0) {
      state.privacySearchEngines.forEach(engine => {
        window.open(engine + encodeURIComponent(query), "_blank");
      });
      privacySearchInput.value = "";
    }
  });



  // Hub Tab Switching
  const switchPrivacyTab = (tab) => {
    [privacyHubSearchTab, privacyHubNoteTab].forEach(t => {
      if (!t) return;
      t.classList.remove("bg-white/10", "shadow-lg");
      t.classList.add("text-white/40", "hover:bg-white/5");
    });
    [privacyHubSearchPane, privacyHubNotePane].forEach(p => p?.classList.add("hidden"));

    if (tab === "search") {
      privacyHubSearchTab.classList.add("bg-white/10", "shadow-lg");
      privacyHubSearchTab.classList.remove("text-white/40", "hover:bg-white/5");
      privacyHubSearchPane.classList.remove("hidden");
    } else if (tab === "note") {
      privacyHubNoteTab.classList.add("bg-white/10", "shadow-lg");
      privacyHubNoteTab.classList.remove("text-white/40", "hover:bg-white/5");
      privacyHubNotePane.classList.remove("hidden");
      privacyNoteInput.focus();
    }
    createIcons({ icons, root: privacyScreen });
  };

  privacyHubSearchTab?.addEventListener("click", () => switchPrivacyTab("search"));
  privacyHubNoteTab?.addEventListener("click", () => switchPrivacyTab("note"));

  // Quick Note Saving
  privacyNoteSaveBtn?.addEventListener("click", async () => {
    const text = privacyNoteInput.value.trim();
    if (!text) return;

    if (state.libraryFolders.length === 0) {
      alert("No library folders found. Please add a folder in settings first.");
      return;
    }

    try {
      const rootFolder = state.libraryFolders[0].handle;
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(':', '-').replace(/ /g, '');
      const filename = `Quick Note ${date} ${time}.md`;
      
      const fileHandle = await rootFolder.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();

      privacyNoteInput.value = "";
      alert(`Note saved as ${filename} in your primary library!`);
      
      // Refresh explorer if it's currently showing the primary library
      if (!explorerSidebar.hidden && state.activeLibraryFolderId === state.libraryFolders[0].id) {
        void refreshActiveLibrary();
      }
    } catch (err) {
      console.error("Error saving quick note:", err);
      alert("Failed to save note. Please check permissions.");
    }
  });

  privacyUnlockBtn?.addEventListener("click", () => {
    if (state.privacyPassword) {
      showPrivacyAuth();
    } else {
      hidePrivacyScreen();
    }
  });

  privacyLockTrigger?.addEventListener("click", showPrivacyScreen);

  privacyAuthForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (privacyAuthInput.value === state.privacyPassword) {
      hidePrivacyAuth();
      hidePrivacyScreen();
    } else {
      privacyAuthError.hidden = false;
      privacyAuthInput.value = "";
      privacyAuthInput.focus();
    }
  });

  privacyAuthCancel?.addEventListener("click", hidePrivacyAuth);

  // Start Clock and Idle Check
  console.log("Starting Privacy Clock...", { privacyClock, privacyDate });
  updatePrivacyClock();
  setInterval(updatePrivacyClock, 1000);
  setInterval(checkPrivacyIdle, 10000); // Check every 10 seconds

  // Always open with lock screen turned on if enabled
  if (state.privacyEnabled) {
    showPrivacyScreen();
  } else {
    // Instantly hide without animation
    state.privacyActive = false;
    privacyScreen.classList.remove("opacity-100");
    privacyScreen.classList.add("pointer-events-none");
    privacyScreen.hidden = true;
  }
}

function updatePrivacyClock() {
  if (!privacyClock) {
    console.error("Privacy Clock element not found!");
    return;
  }
  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', hour12: false };
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  
  if (state.privacyTimezone !== "auto") {
    options.timeZone = state.privacyTimezone;
    dateOptions.timeZone = state.privacyTimezone;
  }

  const timeStr = now.toLocaleTimeString([], options);
  const dateStr = now.toLocaleDateString([], dateOptions);
  
  privacyClock.textContent = timeStr;
  privacyDate.textContent = dateStr;
}

function checkPrivacyIdle() {
  if (!state.privacyEnabled || state.privacyActive) return;
  
  const idleTimeMs = Date.now() - state.lastActivity;
  if (idleTimeMs > state.privacyTimeout * 60000) {
    showPrivacyScreen();
  }
}

function showPrivacyScreen() {
  console.log("showPrivacyScreen called, current state:", { active: state.privacyActive, privacyScreen });
  if (state.privacyActive) return;
  state.privacyActive = true;
  privacyScreen.hidden = false;
  
  // Render Links
  renderPrivacyLinks();
  
  // Trigger animations
  setTimeout(() => {
    privacyScreen.classList.add("opacity-100");
    privacyScreen.classList.remove("pointer-events-none");
    createIcons({ icons, root: privacyScreen });
    console.log("Privacy screen animations triggered.");
  }, 10);
}

function renderPrivacyLinks() {
  if (!privacyShortcuts) return;
  privacyShortcuts.innerHTML = "";
  
  const links = state.privacyLinks.split("\n").map(l => l.trim()).filter(Boolean);
  links.forEach(entry => {
    const parts = entry.split("|");
    const url = parts[0].trim();
    const customLabel = parts[1] ? parts[1].trim() : "";
    let icon = "globe";
    let title = "Link";
    
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      title = hostname.replace("www.", "");
      if (hostname.includes("github")) icon = "code";
      else if (hostname.includes("gmail") || hostname.includes("mail")) icon = "mail";
      else if (hostname.includes("youtube")) icon = "play";
      else if (hostname.includes("twitter") || hostname.includes("x.com")) icon = "message-square";
    } catch {}

    const label = customLabel || title;

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.className = "flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-110 group";
    a.title = label;
    a.innerHTML = `<i data-lucide="${icon}" class="w-6 h-6 text-white/70 group-hover:text-white"></i><span class="text-[10px] font-medium text-white/50 group-hover:text-white/80 transition-colors truncate max-w-[80px]">${label}</span>`;
    privacyShortcuts.appendChild(a);
  });
}

function hidePrivacyScreen() {
  if (!state.privacyActive) return;
  state.privacyActive = false;
  privacyScreen.classList.remove("opacity-100");
  privacyScreen.classList.add("pointer-events-none");
  setTimeout(() => {
    privacyScreen.hidden = true;
  }, 150);
}

function initializeFloatingAi() {
  console.log("Initializing Floating AI Assistant... (v2)");
  
  try {
    const btn = document.getElementById("floating-ai-btn");
    const win = document.getElementById("floating-ai-window");
    const closeBtn = document.getElementById("floating-ai-close");
    const form = document.getElementById("floating-ai-form");
    const input = document.getElementById("floating-ai-input");

    if (!btn || !win) {
      console.warn("Floating AI elements not found in current view. This might be expected if the DOM isn't fully ready yet.", { btn, win });
      // Retry in a moment if not found
      setTimeout(initializeFloatingAi, 500);
      return;
    }

    // Use a fresh listener to avoid duplicates if re-called
    btn.onclick = (e) => {
      console.log("Floating AI Button Triggered!");
      e.stopPropagation();
      const isHidden = win.classList.contains("hidden");
      if (isHidden) {
        win.classList.remove("hidden");
        win.classList.add("flex");
        input?.focus();
      } else {
        win.classList.add("hidden");
        win.classList.remove("flex");
      }
    };

    closeBtn.onclick = () => {
      win.classList.add("hidden");
      win.classList.remove("flex");
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (message) {
        appendAiMessage("user", message);
        input.value = "";
        
        setTimeout(() => {
          if (message.toLowerCase().includes("open")) {
             appendAiMessage("assistant", "Opening your selected AI engine...");
             setTimeout(() => window.open(state.privacyAiEngine, "_blank"), 1000);
          } else {
             appendAiMessage("assistant", "I'm a privacy-focused assistant. For deep reasoning, I can open " + (new URL(state.privacyAiEngine).hostname) + " for you. Just type 'open'.");
          }
        }, 1000);
      }
    };

    // Re-initialize Lucide icons
    createIcons({ icons, root: document.getElementById("floating-ai-container") });
    console.log("Floating AI Assistant initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Floating AI Assistant:", err);
  }
}

function appendAiMessage(role, text) {
  const msgs = document.getElementById("floating-ai-messages");
  if (!msgs) return;
  
  const msg = document.createElement("div");
  msg.className = `ai-message ai-message-${role}`;
  msg.textContent = text;
  msgs.appendChild(msg);
  msgs.scrollTop = msgs.scrollHeight;
}

function showPrivacyAuth() {
  privacyAuthContainer.hidden = false;
  privacyAuthError.hidden = true;
  privacyAuthInput.value = "";
  setTimeout(() => {
    privacyAuthContainer.classList.add("opacity-100");
    privacyAuthInput.focus();
  }, 10);
}

function hidePrivacyAuth() {
  privacyAuthContainer.classList.remove("opacity-100");
  setTimeout(() => {
    privacyAuthContainer.hidden = true;
  }, 500);
}
