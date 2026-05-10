import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// keyof-source mapped expansion must skip symbol-keyed members per TS spec instead of
// bailing the entire enumeration; sibling string-keyed members still narrow
interface I {
  [Symbol.iterator]: () => Iterator<number>;
  items: number[];
}
type Mapped = { [K in keyof I]: I[K] };
declare const m: Mapped;
_atMaybeArray(_ref = m.items).call(_ref, 0);
_includesMaybeArray(_ref2 = m.items).call(_ref2, 1);