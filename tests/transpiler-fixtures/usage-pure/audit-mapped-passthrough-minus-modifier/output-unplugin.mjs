import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// `-readonly` and `-?` modifiers strip flags but preserve the value type;
// passthrough detection should still recover the original element type for dispatch
type Required2<T> = { [K in keyof T]-?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
declare const r: Required2<{ a?: number[] }>;
declare const m: Mutable<{ readonly a: string[] }>;
_atMaybeArray(_ref = r.a).call(_ref, 0);
_includesMaybeArray(_ref2 = m.a).call(_ref2, "x");