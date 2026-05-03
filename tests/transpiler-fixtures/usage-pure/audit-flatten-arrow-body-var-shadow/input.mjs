// multi-decl flatten + sibling arrow EXPRESSION body that needs block conversion (instance
// method dispatch generates `var _ref;`). inside the arrow's IIFE-wrapped scope a `var
// globalThis` shadows the outer global. the wrap by consumeRefBindingsInRange uses the
// raw original source, then polyfillSiblingReceiverRefs must NOT rewrite the inner ref
const { Array: { from } } = globalThis, val = (function () {
  var globalThis = 'shadow';
  return [globalThis].values();
})();
export { from, val };
