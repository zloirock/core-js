import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// two-level mapped passthrough inside a generic. MyWrap<T> -> Copy<T> -> T.
// before fix, TSMappedType branch in substituteTypeParams called resolveTypeAnnotation
// on the passthrough body (dropping typeParamMap), so `T` inside `{ [K in keyof T]: T[K] }`
// fell back to unresolved -> generic `_at`. fix: delegate back to substituteTypeParams with
// the typeParamMap so `T`-ref resolves to Array<string>. `.at()` -> Array-specific
type Copy<T> = { [K in keyof T]: T[K] };
type MyWrap<T> = Copy<T>;
declare const a: MyWrap<string[]>;
_atMaybeArray(a).call(a, 0);
_flatMaybeArray(a).call(a);