interface Settings {
  label: string;
  count: number;
}

declare function loadSettings(): unknown;
const settings: Settings = loadSettings();
settings.label.at(0);
