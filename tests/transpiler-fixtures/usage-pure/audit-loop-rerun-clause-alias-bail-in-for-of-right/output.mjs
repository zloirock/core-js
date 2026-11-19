import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
let kRight = "fromCodePoint";
export function inForOfRight() {
  const chars = [];
  for (const ch of String[kRight](66, 67)) {
    _pushMaybeArray(chars).call(chars, ch);
    kRight = "raw";
  }
  return chars;
}