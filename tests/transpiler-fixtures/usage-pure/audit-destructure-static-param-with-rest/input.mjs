// parameter destructure with RestElement: `function f({ from, ...rest } = Array) { ... }`.
// `tryBodyExtractFromParamDestructure` emits `let from = _Array$from;` at function body
// top + AST-mutates the destructure value to `_unused` (preserves rest semantics).
// receiver narrowing through `arr = from('hi')` inside the body finds the polyfill entry
// via the body-extract alias even though scope binding is now ambiguous post-mutation
function build({ from, ...rest } = Array) {
  const xs = from('xy');
  return xs.at(0) + xs.findLast(p => p) + xs.flat().length;
}
export { build };
