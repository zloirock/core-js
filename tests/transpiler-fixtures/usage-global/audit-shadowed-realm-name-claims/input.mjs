// a SHADOWED realm name holds the user's binding, not the surface: no realm claim resolves
// through it, so the shadowed rows inject only the generic `.name` key bias, never the Map
// family or a realm entry - the surface classifiers ask the binding-aware canon, not the file
// census alone. the unshadowed twin is the negative whose imports keep the claim alive.
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

// NEGATIVE: the unshadowed twin claims - the only row that injects
export function unshadowed() {
  let c = 0, d = 0;
  return (d++, (c++, globalThis.self))?.Map.name;
}
