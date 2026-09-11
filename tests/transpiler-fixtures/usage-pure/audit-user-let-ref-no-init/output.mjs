import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// User-declared `let _ref;` without init followed by reassignment.
// Plugin must treat `_ref` as a real user binding and skip past it
// when allocating its own ref slots
let _ref;
_ref = [1, 2];
console.log(_ref);
_atMaybeArray(_ref2 = [3, 4]).call(_ref2, 0);