import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// mapped type over source object containing symbol-keyed members. expandMappedTypeMembers
// must skip computed-symbol keys (no static name to enumerate) without crashing - mapped
// rename machinery operates on string keys, symbol keys would have no representable rename
// target. fallback: emit only the string-keyed members. `r.items` resolves to the original
// number[] type. distinct methods discriminate narrow Array hint preservation through the
// mapped pass-through
type Mapped<T> = { [K in keyof T]: T[K] };
declare const r: Mapped<{ items: number[]; [Symbol.iterator]: () => Iterator<number> }>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_includesMaybeArray(_ref2 = r.items).call(_ref2, 1);
