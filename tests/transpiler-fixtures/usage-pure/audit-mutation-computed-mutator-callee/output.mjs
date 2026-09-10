import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// COMPUTED mutator-callee keys (static string, const alias, optional chain, computed proxy member),
// an ALIASED namespace and EXTRACTED / DESTRUCTURED mutator bindings resolve through the same
// binding-aware canons as their dotted twins: a target pure can back takes the patch on the injected
// constructor, and `Array` / `Object`, which it cannot, stay native on the mutation and the read alike
Object['defineProperty'](Array, 'from', {
  value: custom
});
const r1 = Array.from([1]);
const m = 'defineProperty';
Object[m](_Iterator, 'from', {
  value: custom2
});
const r2 = _Iterator.from(r1);
_Reflect$set(_Map, 'groupBy', custom3);
const r3 = _Map.groupBy(r2, fn);
_Object$defineProperties(_Promise, {
  try: {
    value: custom4
  }
});
const r4 = _Promise.try(fn);
_globalThis['Object'].defineProperty(Object, 'groupBy', {
  value: custom5
});
const r5 = Object.groupBy(r1, fn);
_Object$assign(Array, {
  of: custom6
});
const r6 = Array.of(1);
const O = Object;
O.defineProperty(Array, 'fromAsync', {
  value: custom7
});
const r7 = Array.fromAsync([1]);
const dp = _Object$defineProperty;
dp(_Iterator, 'zip', {
  value: custom8
});
const r8 = _Iterator.zip([r1, r2]);
const rs = _Reflect$set;
rs(_Promise, 'allSettled', custom9);
const r9 = _Promise.allSettled([r4]);