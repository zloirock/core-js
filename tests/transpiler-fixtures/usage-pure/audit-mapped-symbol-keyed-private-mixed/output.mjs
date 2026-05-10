import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref, _ref2;
// keyof-source mapped expansion with mix of computed (Symbol-keyed), private, and string
// keys; all non-string-keyed members must skip continue while string-keyed survive
class Mixed {
  ['#priv'] = 1;
  [_Symbol$iterator] = () => null;
  declare items: number[];
  declare flags: boolean[];
}
type Mapped = { [K in keyof Mixed]: Mixed[K] };
declare const m: Mapped;
_atMaybeArray(_ref = m.items).call(_ref, 0);
_includesMaybeArray(_ref2 = m.flags).call(_ref2, true);