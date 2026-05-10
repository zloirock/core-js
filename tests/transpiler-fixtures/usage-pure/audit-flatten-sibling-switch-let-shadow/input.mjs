// outer flatten of `globalThis` extracts `Array.from`. sibling IIFE init contains a
// switch with `let globalThis` in case body. ES spec: switch creates one shared block
// scope across cases - let `globalThis` shadows the outer global throughout the switch
// block. case body's `[globalThis].values()` should NOT have its `globalThis` rewritten
// to the polyfill alias `_globalThis`. without `SwitchStatement` in BLOCK_SCOPE_TYPES,
// the let is invisible to `polyfillSiblingReceiverRefs`'s walk; the inner reference gets
// rewritten incorrectly to the polyfill binding name
const { Array: { from } } = globalThis, val = (function (kind) {
  switch (kind) {
    case 'a':
      let globalThis = 'shadow';
      return [globalThis].values();
    default:
      return [].values();
  }
})('a');
export { from, val };
