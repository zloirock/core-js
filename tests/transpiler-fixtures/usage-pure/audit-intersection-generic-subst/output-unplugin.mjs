import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// intersection wrapping a generic: `X<T> = Holder<T[]> & { ... }` - outer type-param
// flows through the intersection branch to `Holder`, so `x.data.at(0)` resolves as Array.at
type Holder<T> = { data: T };
type X<T> = Holder<T[]> & { meta: string };
declare const x: X<number>;
_globalThis.__r = _atMaybeArray(_ref = x.data).call(_ref, 0);