// TSMappedType that renames keys via `as ...` - plugin cannot statically resolve which
// property `_foo` corresponds to in the source object, so the receiver's type is
// unknown and `.at(0)` falls back to the generic instance-method polyfill
type Renamed<T> = { [K in keyof T as `_${string & K}`]: T[K] };
declare const r: Renamed<{ foo: string[] }>;
r._foo.at(0);
