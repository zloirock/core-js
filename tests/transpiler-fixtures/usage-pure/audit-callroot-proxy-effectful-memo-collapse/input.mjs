// an EFFECTFUL call/IIFE-rooted proxy chain with an UNRESOLVED sibling key (`{ from, length } = (() => {
// eff(); return globalThis; })().self.Array`): because the SE-bearing receiver has a key left unresolved,
// it is MEMOIZED through a function-IIFE param (runs exactly once as the argument). the proxy hop `.self`
// must collapse in the memo argument (`(call, _globalThis).Array`) - a verbatim hop reads an undefined
// intermediate off the global object off-browser (ie:11 / Node) and throws. babel and unplugin agree on
// the collapse + the import set; they differ ONLY in the memo-IIFE wrapping parens (AST codegen vs source
// text), a cosmetic recorded in the output-unplugin.mjs sidecar
function eff() {}
function f({ from, length } = (() => {
  eff();
  return globalThis;
})().self.Array) {
  return [from([1]), length];
}
export { f };
