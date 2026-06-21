import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// declared return type is an all-structural TSIntersectionType; body is the stub `return
// null as any` (typical for declaration-only generic helpers). without bailing on the
// structural intersection, body inference's null type overrides the intersection's member
// shape and `obj.foo().at(0)` emits no polyfill. bailing routes through annotation-level
// member lookup, which finds `foo` returning `string[]` and emits `_atMaybeArray`
function wrap(): { foo(): string[] } & { bar(): number } { return null as any; }
const obj = wrap();
const result = obj.foo();
_atMaybeArray(result).call(result, 0);