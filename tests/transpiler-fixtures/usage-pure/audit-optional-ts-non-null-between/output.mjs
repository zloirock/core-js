import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// TS `!` non-null between optional accesses `x?.a!.b`: the wrapper is peeled for the
// chain rewrite to recognise the receiver shape.
arr == null ? void 0 : _includes(_ref = _at(arr).call(arr, -1)!).call(_ref, "x");