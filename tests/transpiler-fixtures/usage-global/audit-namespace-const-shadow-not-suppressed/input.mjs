// a non-var (`const`) binding inside a namespace block is scoped to that namespace, so a bare
// `new Map()` outside the block is the real global. the parser over-hoists the namespace const to
// the enclosing scope; the position-aware over-hoist guard drops it for the outside use so the
// global constructor polyfill is injected
namespace N {
  export const Map = 1;
}
new Map();
