import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// a this-param-ONLY overload takes zero call args - TS routes a one-arg call to the next arm
declare function k(this: Window): number[];
declare function k(x: string): string;
export const viaZeroArg = _includesMaybeString(_ref = k('a')).call(_ref, 'b');