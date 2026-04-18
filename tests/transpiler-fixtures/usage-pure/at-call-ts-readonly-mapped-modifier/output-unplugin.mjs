var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
declare const x: MyReadonly<{ items: number[] }>;
_atMaybeArray(_ref = x.items).call(_ref, 0);