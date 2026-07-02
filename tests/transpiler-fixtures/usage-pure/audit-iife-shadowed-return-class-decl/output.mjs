// IIFE that returns a locally declared `class Symbol`: the class shadows the global,
// so the receiver of `'iterator' in ...` is the user class, not the global. No polyfill
// for `Symbol` is emitted.
'iterator' in (() => {
  class Symbol {}
  return Symbol;
})();