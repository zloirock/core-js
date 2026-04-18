var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// documented approximation: `Parameters<typeof fn>` picks only the FIRST param's type
// as the tuple element. regression lock for future union-inference changes
function fn(x: string, y: number) { return x; }
declare const args: Parameters<typeof fn>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);