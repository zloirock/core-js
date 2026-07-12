import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a leading `this` pseudo-param fills an AST param slot but no runtime arg slot: overload
// arity and per-slot pairing must align with the CALL args, so a this-annotated overload
// arg-matches like its unannotated twin instead of being skipped or mismatched
declare function g(this: Window, x: string): number[];
declare function g(x: number): string;
export const viaFunction = _atMaybeArray(_ref = g('a')).call(_ref, 0);

// a this-param-ONLY overload takes zero call args - TS routes a one-arg call to the next arm
declare function k(this: Window): number[];
declare function k(x: string): string;
export const viaZeroArg = _includesMaybeString(_ref2 = k('a')).call(_ref2, 'b');

// bodyless declare-class methods pair the same way
declare class C {
  m(this: C, x: string): number[];
  m(x: number): string;
}
declare const c: C;
export const viaDeclareClass = _atMaybeArray(_ref3 = c.m('a')).call(_ref3, 1);

// interface method signatures too
interface I {
  pick(this: I, x: string): number[];
  pick(x: number): string;
}
declare const i: I;
export const viaInterface = _includesMaybeArray(_ref4 = i.pick('a')).call(_ref4, 1);

// and call signatures on a callable object type
declare const f: {
  (this: Window, x: string): number[];
  (x: number): string;
};
export const viaCallSignature = _atMaybeArray(_ref5 = f('a')).call(_ref5, 2);