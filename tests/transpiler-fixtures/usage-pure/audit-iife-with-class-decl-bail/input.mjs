// IIFE body containing a ClassDeclaration: receiver should stay opaque
// because the locally-bound class shadows free identifiers in the return.
const out = (() => {
  class Map {
    static at(x) { return x; }
  }
  return Map;
})().at(0);
