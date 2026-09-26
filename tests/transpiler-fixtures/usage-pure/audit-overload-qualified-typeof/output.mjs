import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// a call through an aliased QUALIFIED `typeof NS.fn` arg-discriminates the overload set
// exactly like the bare `typeof fn` form - the segments channel serves both; falling back
// to the type-level rightmost-overload rule ignored the args
declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = _atMaybeArray(_ref = f(5)).call(_ref, 0);

// deeper qualification resolves through the same channel
declare namespace Outer {
  namespace Sub {
    function d(x: number): number[];
    function d(x: string): string;
  }
}
declare const f2: typeof Outer.Sub.d;
export const viaDeepQualified = _includesMaybeArray(_ref2 = f2(5)).call(_ref2, 1);

// a top-typed first arm (`unknown`) accepts every argument, so an undiscriminating arg still
// resolves the call to it - TS first-match
declare namespace NS2 {
  function w(x: unknown): number[];
  function w(x: string): string;
}
declare const f3: typeof NS2.w;
export const viaTopFirstArm = _atMaybeArray(_ref3 = f3(opaque)).call(_ref3, 0);

// a divergent set whose first arm the arg-match cannot weigh (`object`) WIDENS to the generic
// helper instead of handing back one arm's type-specific dispatcher
declare namespace NS3 {
  function w(x: object): number[];
  function w(x: string): string;
}
declare const f4: typeof NS3.w;
export const viaDivergentWiden = _at(_ref4 = f4(opaque)).call(_ref4, 0);