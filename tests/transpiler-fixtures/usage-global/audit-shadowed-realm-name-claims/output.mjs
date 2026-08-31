import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
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
  let c = 0,
    d = 0;
  return (d++, c++, self.globalThis)?.Map.name;
}
export function shadowedWindow(window) {
  let c = 0,
    d = 0;
  return (d++, c++, window.self)?.Map.name;
}

// NEGATIVE: the unshadowed twin claims - the only row that injects
export function unshadowed() {
  let c = 0,
    d = 0;
  return (d++, c++, globalThis.self)?.Map.name;
}