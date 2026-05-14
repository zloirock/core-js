// Identifier visitor (value-position) must honour hoisted-var shadows in nested non-
// function blocks. estree-toolkit registers `var` declarations in the block's own scope
// rather than hoisting to the enclosing function; the visitor must thread its path so
// the var-scope fallback fires - same contract as the JSX (`audit-jsx-tag-var-hoist-
// shadow`) and TS annotation (`audit-ts-annotation-var-hoist-shadow`) variants, but for
// plain `Map.from(...)` / `Map(...)` value-position references. without the fallback,
// `Map.from` would inject the Map polyfill chain even though the receiver resolves to
// the local hoisted var at runtime.
function App(cond) {
  if (cond) {
    var Map = function () { return null; };
  }
  return Map.from([1, 2, 3]);
}
