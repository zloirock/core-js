import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a predicate whose overload headers name DIFFERENT parameters: the truthy branch narrows
// each named argument via its own header - the first arg to the string variant, the second
// to the array variant
declare function pick(x: unknown, y: unknown): x is string;
declare function pick(x: unknown, y: unknown): y is number[];
declare const e: string | string[];
declare const f: string | number[];
let r1;
let r2;
if (pick(e, f)) {
  r1 = _atMaybeString(e).call(e, 2);
  r2 = _includesMaybeArray(f).call(f, 3);
}
export { r1, r2 };