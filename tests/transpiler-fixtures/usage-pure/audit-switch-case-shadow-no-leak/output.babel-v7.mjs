import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a braceless TS declaration in a switch case shadows only the SWITCH BLOCK scope - a use AFTER the
// switch (outside that block) sees the global again and DOES polyfill, and an unrelated global is
// unaffected. the shadow detection must not leak the case-scoped binding to enclosing uses. distinct
// globals per line so each injected polyfill is attributable.
switch (x) {
  case 1:
    enum Map {
      A,
    }
    new Map();
    break;
}
const after = new _Map();
const other = new _WeakMap();