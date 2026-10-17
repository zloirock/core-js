function viaNamespace() {
  { var WeakSet = globalThis.WeakMap; }
  return new WeakSet();
}
export const n = viaNamespace();
