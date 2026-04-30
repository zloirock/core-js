// IIFE body declares a `class` whose name shadows a global, and that class is what gets
// returned. inlining the bare return `Symbol` would resolve at the caller's scope where
// `Symbol` IS the global - emitting `_Symbol` polyfill. but the body's `class Symbol`
// is a local shadow returning a user class with completely different shape. fix: bail
// inline whenever a ClassDeclaration is in the body
'iterator' in (() => {
  class Symbol {}
  return Symbol;
})();
