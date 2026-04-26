import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Parameters<typeof fn>[N]` indexing into a rest-param position of a `declare function`:
// the rest element type `string[]` flows through, so `x` narrows to `string` and the
// `at` / `includes` instance calls pick the string-specific polyfill variant.
declare function fn(a: number, b: boolean, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[2];
_atMaybeString(x).call(x, 0);
_includesMaybeString(x).call(x, 'foo');