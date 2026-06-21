// outer flatten of `globalThis` extracts `Array.from`. a sibling IIFE has a switch with
// `let globalThis` in a case body. ES spec: one shared block scope across cases, so the
// let shadows the outer global throughout the switch. the sibling-ref rewrite must treat
// SwitchStatement as block scope, else `[globalThis].values()` is wrongly aliased to `_globalThis`
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
