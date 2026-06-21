// value-position Identifier references must honour hoisted-var shadows in nested non-
// function blocks. estree-toolkit registers `var` in the block's own scope rather than
// hoisting to the enclosing function, so a var-scope fallback is needed - same contract as
// the JSX (`audit-jsx-tag-var-hoist-shadow`) and TS-annotation (`audit-ts-annotation-var-
// hoist-shadow`) variants. without it `Map.from` injects the Map polyfill chain even though
// the receiver resolves to the local hoisted var at runtime.
function App(cond) {
  if (cond) {
    var Map = function () {
      return null;
    };
  }
  return Map.from([1, 2, 3]);
}