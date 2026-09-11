// a `class` declared inside a namespace block is scoped to that namespace, so the outside
// `new Set().union(...)` is the real global. the over-hoist guard drops the over-hoisted namespace
// class for the outside use so the Set instance polyfills are injected
namespace N {
  export class Set {
    size = 0;
  }
}
new Set().union([1]);
