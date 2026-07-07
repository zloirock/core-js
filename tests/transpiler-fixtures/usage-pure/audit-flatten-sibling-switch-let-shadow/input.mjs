// outer flatten of `globalThis` extracts `Array.from`. a sibling IIFE has a switch with
// `let globalThis` in a case body. ES spec: one shared block scope across cases, so the
// let shadows the outer global throughout the switch. the sibling-ref rewrite must treat
// SwitchStatement as block scope, else `[globalThis].values()` is wrongly aliased to `_globalThis`
// the DISCRIMINANT is evaluated in the ENCLOSING scope (before the case block's lexical
// environment exists), so the case-body `let` must NOT shadow it - it still substitutes
const { Array: { from } } = globalThis, val = (function (kind) {
  switch (kind === 'a' ? globalThis : kind) {
    case 'a':
      let globalThis = 'shadow';
      return [globalThis].values();
    default:
      return [].values();
  }
})('a');
export { from, val };
