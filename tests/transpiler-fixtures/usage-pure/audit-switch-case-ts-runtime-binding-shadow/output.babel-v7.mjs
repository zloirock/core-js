import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a braceless TS runtime declaration in a switch CASE binds the whole switch BLOCK scope (all cases),
// so it shadows the global for a use in the same case AND a fall-through case - the reference must stay
// native, not get the pure polyfill substituted over the user shadow. an ambient `declare enum` emits no
// runtime binding, so its global still polyfills. distinct globals + declaration forms per line.
switch (x) {
  case 1:
    enum Map {
      A,
    }
    new Map();
    break;
  case 2:
    namespace Set {
      export const z = 1;
    }
    break;
  case 3:
    new Set();
    break;
  case 4:
    declare enum WeakMap {
      A,
    }
    new _WeakMap();
}