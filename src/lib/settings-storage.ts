export interface Settings {
  confirmDeletions: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  confirmDeletions: true,
};

const STORAGE_KEY = 'settings';

export async function loadSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const stored = result[STORAGE_KEY] as Partial<Settings> | undefined;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}
