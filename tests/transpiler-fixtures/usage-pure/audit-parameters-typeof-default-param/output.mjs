var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Parameters<typeof fn>` must unwrap AssignmentPattern (`x = 'a'`) to read the underlying
// `typeAnnotation` on `.left`, so chained `.at(-1)` on the tuple element resolves to string
function fn(x: string = 'a') {
  return x;
}
declare const args: Parameters<typeof fn>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);