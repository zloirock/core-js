// Sibling IIFE shadows the global with a local `var globalThis`; flatten must respect that scope.
// Receiver-ref rewrite must skip identifiers shadowed by inner bindings, otherwise the IIFE breaks.
const { Array: { from } } = globalThis, val = (function () {
  var globalThis = 'shadow';
  return [globalThis].values();
})();
export { from, val };
