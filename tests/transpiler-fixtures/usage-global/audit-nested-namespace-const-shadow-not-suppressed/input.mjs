// a `const` declared inside a DOUBLY-nested namespace block is scoped to the inner namespace, so the
// bare `new Map()` outside is the real global. the position-aware over-hoist guard drops the
// over-hoisted inner-namespace const for the outside use so the constructor polyfill is injected
namespace A {
  export namespace B {
    export const Map = 1;
  }
}
new Map();
