import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// member-call dispatch on `Foo | null` — null branch has no method, but should NOT bail
// the whole union. dispatch narrows to Foo's method polyfill
declare const x: string[] | null;
_atMaybeArray(_ref = x!).call(_ref, 0);