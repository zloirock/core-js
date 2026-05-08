// destructuring `globalThis` while a sibling IIFE locally shadows `globalThis` via
// `var globalThis = ...` in a nested block. the destructure must still resolve the
// real global; the shadow is confined to the IIFE's scope
const { Array: { from } } = globalThis, val = (function () {
  if (true) {
    var globalThis = 'shadow';
  }
  return globalThis;
})();
console.log(from, val);
