import _Array$of from "@core-js/pure/actual/array/of";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// nested proxy-global flatten declarator next to a sibling whose init is a multi-hop static off
// the same proxy-global root (`globalThis.Object.getOwnPropertyNames`). `Object` has no
// whole-constructor polyfill, so the receiver-ref skip-check must walk the full enclosing member
// chain to the static method - otherwise the receiver root gets double-substituted and compose
// crashes. distinct static method and flatten key from the sibling-static fixtures
const of = _Array$of;
const names = _Object$getOwnPropertyNames({});
of([1]);
names.length;