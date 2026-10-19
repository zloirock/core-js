import "core-js/modules/es.string.at";
interface Settings {
  label: string;
  count: number;
}
declare function loadSettings(): unknown;
// @ts-expect-error the annotation, not the initializer, types the value, which is the shape under test
const settings: Settings = loadSettings();
settings.label.at(0);