import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a divergent set whose first arm the arg-match cannot weigh (`object`) WIDENS to the generic
// helper instead of handing back one arm's type-specific dispatcher
declare namespace NS3 {
  function w(x: object): number[];
  function w(x: string): string;
}
declare const f4: typeof NS3.w;
export const viaDivergentWiden = _at(_ref = f4(opaque)).call(_ref, 0);