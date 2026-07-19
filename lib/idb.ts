const DB_NAME = "pdf24x_db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("recent_files")) {
        const store = db.createObjectStore("recent_files", { keyPath: "id", autoIncrement: true });
        store.createIndex("tool", "tool", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains("tool_results")) {
        db.createObjectStore("tool_results", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("preferences")) {
        db.createObjectStore("preferences", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface RecentFile {
  id?: number;
  tool: string;
  fileName: string;
  fileSize: number;
  timestamp: number;
  resultSize?: number;
  status: "success" | "error";
}

export async function saveRecentFile(file: RecentFile): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("recent_files", "readwrite");
    tx.objectStore("recent_files").add({ ...file, timestamp: Date.now() });
  } catch {}
}

export async function getRecentFiles(tool?: string): Promise<RecentFile[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("recent_files", "readonly");
      const store = tx.objectStore("recent_files");
      const req = tool ? store.index("tool").getAll(tool) : store.index("timestamp").getAll();
      req.onsuccess = () => resolve((req.result as RecentFile[]).reverse());
      req.onerror = () => resolve([]);
    });
  } catch { return []; }
}

export async function savePreference(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("preferences", "readwrite");
    tx.objectStore("preferences").put({ key, value });
  } catch {}
}

export async function getPreference<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("preferences", "readonly");
      const req = tx.objectStore("preferences").get(key);
      req.onsuccess = () => resolve(req.result?.value ?? defaultValue);
      req.onerror = () => resolve(defaultValue);
    });
  } catch { return defaultValue; }
}

export async function saveToolResult(id: string, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("tool_results", "readwrite");
    tx.objectStore("tool_results").put({ id, data, timestamp: Date.now() });
  } catch {}
}

export async function getToolResult<T>(id: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("tool_results", "readonly");
      const req = tx.objectStore("tool_results").get(id);
      req.onsuccess = () => resolve(req.result?.data ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

export async function clearRecentFiles(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("recent_files", "readwrite");
    tx.objectStore("recent_files").clear();
  } catch {}
}
