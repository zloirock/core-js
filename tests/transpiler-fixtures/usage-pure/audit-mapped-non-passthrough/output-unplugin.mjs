import _at from "@core-js/pure/actual/instance/at";
var _ref;
// TSMappedType non-passthrough (remaps via `as`) — unwrapMappedTypePassthrough returns null;
// resolveTypeAnnotation falls through `case 'TSMappedType'` returning null. receiver unknown.
type Renamed<T> = { [K in keyof T as `_${string & K}`]: T[K] };
declare const r: Renamed<{ foo: string[] }>;
_at(_ref = r._foo).call(_ref, 0);