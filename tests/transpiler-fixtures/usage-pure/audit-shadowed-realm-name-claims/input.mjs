// a SHADOWED realm name holds the user's binding, not the surface: no claim resolves through it,
// no hop folds off it, and the source's own `?.` keeps its guard - the surface classifiers ask
// the binding-aware canon, never the file census alone. the unshadowed twin is the negative that
// keeps the fold and the claim alive.
export function bare(self) {
  return self.globalThis?.Map.name;
}
export function seq(self) {
  let d = 0;
  return (d++, self.globalThis)?.Map.name;
}
export function nested(self) {
  let c = 0, d = 0;
  return (d++, (c++, self.globalThis))?.Map.name;
}
export function shadowedWindow(window) {
  let c = 0, d = 0;
  return (d++, (c++, window.self))?.Map.name;
}

// NEGATIVE: the unshadowed twin folds and claims
export function unshadowed() {
  let c = 0, d = 0;
  return (d++, (c++, globalThis.self))?.Map.name;
}
