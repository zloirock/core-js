import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Direct mapped type passthrough WITHOUT alias: `{ [K in keyof T]: T[K] }` directly in annotation position,
// not via `type Copy<T> = ...`. resolveTypeAnnotation TSMappedType branch (line 1828) calls
// unwrapMappedTypePassthrough then resolveTypeAnnotation on the passthrough.
declare const x: { [K in keyof {
  data: number[];
}]: {
  data: number[];
}[K] };
_atMaybeArray(_ref = x.data).call(_ref, 0);