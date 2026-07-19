import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `Parameters<typeof fn>` element type = commonType fold over ALL params: differing param types
// (here `string | number`) fold to a GENERIC element, so a value read off the tuple (`args.at(0)`)
// chains through the generic `.at`, NOT the first param's type - which would mis-dispatch a later
// element (a number) through the string helper. same-typed params keep their precise element type;
// literal index `T[N]` still picks the exact N-th via findTupleElement
function fn(x: string, y: number) {
  return x;
}
declare const args: Parameters<typeof fn>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _at(_ref).call(_ref, -1);