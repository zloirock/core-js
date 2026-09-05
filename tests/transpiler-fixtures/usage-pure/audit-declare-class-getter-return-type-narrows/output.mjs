import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a getter in an ambient `declare class` exposes its declared return type when accessed (no body to
// resolve), so `c.foo` is the array and `c.foo.at()` gets the array-specific polyfill. `at` (Array
// AND String) makes the resolution observable - a bail to unknown would emit the generic instance
// `at`. regression lock: the bodyless ambient getter resolves its return type, not collapse to
// Function. both plugins agree.
declare class C {
  get foo(): number[];
}
declare const c: C;
_atMaybeArray(_ref = c.foo).call(_ref, 0);