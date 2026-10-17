// Exported readers retain unknown callers beside the closed example calls below.
// A conditionally initialized block-hoisted alias keeps its realm-identity guard.
// The realm branch answers the is-iterable value test (a sham Symbol.iterator would
// never be found on an iterable), while an uninitialized alias preserves the native throw.
export function f(c, obj) {
  if (c) {
    var g = globalThis;
  }
  return g.Symbol.iterator in obj;
}
f(true, []);
