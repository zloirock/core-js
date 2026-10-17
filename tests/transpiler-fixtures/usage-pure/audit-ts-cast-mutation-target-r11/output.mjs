import _Array$of from "@core-js/pure/actual/array/of";
// the same key spelling inside a PATTERN: a destructure names its slot through the same resolver a
// member read does, so an enum-member key extracts exactly as its literal twin - and the patched
// enum declines there too
enum PatKeys {
  OF = 'of'
}
const fromEnumKey = _Array$of;
export const r11 = typeof fromEnumKey;