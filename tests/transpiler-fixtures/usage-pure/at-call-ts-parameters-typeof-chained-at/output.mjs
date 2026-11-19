import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `Parameters<typeof fn>` element type = first param annotation (`number[]`) flows through
// to the chained `.at(0)` on the result - would otherwise resolve as generic instance-at
declare function fn(xs: number[]): void;
declare const args: Parameters<typeof fn>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);