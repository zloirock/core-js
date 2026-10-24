import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a braceless TS runtime declaration in a switch CASE binds the whole switch BLOCK scope (all cases),
// so it shadows the global for a use in the same case AND a fall-through case - the reference must stay
// native, not get the pure polyfill substituted over the user shadow. an ambient `declare enum` emits no
// runtime binding, so its global still polyfills. distinct globals + declaration forms per line.
switch (x) {
  case 1:
    enum Map {
      A
    }
    // @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
    new Map();
    break;
  case 2:
    // @ts-expect-error a namespace below the top level is the shape under test
    namespace Set {
      export const z = 1;
    }
    break;
  case 3:
    // @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
    new Set();
    break;
  case 4:
    // @ts-expect-error an ambient declaration inside a block, which tsc refuses, is the shape under test
    declare enum WeakMap {
      A
    }
    // @ts-expect-error the ambient declaration types the read for tsc alone, and the runtime reads the global
    new _WeakMap();
}
export {};