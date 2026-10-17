// when one of the duplicate spellings RESOLVES, the collapsed entry must keep the polyfill rather
// than the passthrough, or the import would be dropped and both bindings would read native
const duplicateResolvedSlot = (function ({ keys: k1, 'keys': k2 } = Object) {
  return [k1, k2];
})();
export { duplicateResolvedSlot };
