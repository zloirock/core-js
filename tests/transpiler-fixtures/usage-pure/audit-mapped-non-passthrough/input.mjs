// TSMappedType non-passthrough (remaps via `as`) — unwrapMappedTypePassthrough returns null;
// resolveTypeAnnotation falls through `case 'TSMappedType'` returning null. receiver unknown.
type Renamed<T> = { [K in keyof T as `_${string & K}`]: T[K] };
declare const r: Renamed<{ foo: string[] }>;
r._foo.at(0);
