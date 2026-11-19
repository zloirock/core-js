import _globalThis from "@core-js/pure/actual/global-this";
// A computed constructor key still runs when a pattern default keeps the native slot.
export function read() {
  const {
    [(effect(), 'Map')]: {
      fill,
      z
    } = {}
  } = _globalThis;
  return [fill, z];
}