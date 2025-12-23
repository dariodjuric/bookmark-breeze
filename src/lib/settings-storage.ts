export interface Settings {
  confirmDeletions: boolean;
  expandAllByDefault: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  confirmDeletions: true,
  expandAllByDefault: true,
};

const STORAGE_KEY = 'settings';

export async function loadSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}
