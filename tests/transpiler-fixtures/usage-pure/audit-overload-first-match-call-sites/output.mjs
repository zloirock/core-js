import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// every overload call-return site arg-discriminates instead of picking the first / last
// arm: object-type call signatures, an aliased `typeof fn` call, an overloaded ambient
// callee under a member chain, and an overloaded interface method under a member chain
interface Make {
  (x: number): number[];
  (x: string): string;
}
declare const make: Make;
export const viaCallSignature = _atMaybeArray(_ref = make(5)).call(_ref, 0);
declare function fn(x: number): number[];
declare function fn(x: string): string;
declare const aliased: typeof fn;
export const viaTypeofCall = _includesMaybeArray(_ref2 = aliased(0)).call(_ref2, 1);
declare function pick(x: string): {
  m: number[];
};
declare function pick(x: number): {
  m: string;
};
export const viaAmbientChain = _atMaybeString(_ref3 = pick(0).m).call(_ref3, 0);
interface Wrap {
  m(x: string): {
    v: number[];
  };
  m(x: number): {
    v: string;
  };
}
declare const w: Wrap;
export const viaMemberChain = _includesMaybeString(_ref4 = w.m(0).v).call(_ref4, 'a');