import _globalThis from "@core-js/pure/actual/global-this";
export function run() {
  return [delete (0, _globalThis.slot), delete (missingPrefix, _globalThis).slot];
}