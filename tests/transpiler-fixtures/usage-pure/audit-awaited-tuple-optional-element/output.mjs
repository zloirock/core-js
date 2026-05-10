import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// optional tuple element inside Awaited: `Awaited<[A, B?]>` - TSOptionalType wrapping
// the inner Promise must be peeled while keeping the optional structure intact
type T = Awaited<[Promise<number[]>, Promise<string[]>?]>;
declare const t: T;
_atMaybeArray(_ref = t[0]).call(_ref, 0);