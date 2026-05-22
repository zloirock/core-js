import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// declared return type is an all-structural TSIntersectionType. body is the stub `return
// null as any` (typical for declaration-only generic helpers). without the structural-bail
// in return-type resolution, body inference's `$Primitive('null')` would override the
// intersection's member shape and `obj.foo().at(0)` would emit no polyfill. with the bail,
// the resolver routes through annotation-level member lookup which finds `foo` returning
// `string[]` and emits the array-narrow polyfill `_atMaybeArray`
function wrap(): { foo(): string[] } & { bar(): number } { return null as any; }
const obj = wrap();
const result = obj.foo();
_atMaybeArray(result).call(result, 0);