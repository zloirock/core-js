import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Parameters<typeof fn>[N]` where `fn` has rest param `...rest: string[]`, declared in
// ambient `declare function` form. TSDeclareFunction must be treated as a scope owner so
// the RestElement resolves cleanly; `x` infers to `string` and gets the string polyfills
declare function fn(a: number, b: boolean, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[2];
_atMaybeString(x).call(x, 0);
_includesMaybeString(x).call(x, 'foo');