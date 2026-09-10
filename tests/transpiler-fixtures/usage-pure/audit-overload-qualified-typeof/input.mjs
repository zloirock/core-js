// a call through an aliased QUALIFIED `typeof NS.fn` arg-discriminates the overload set
// exactly like the bare `typeof fn` form - the segments channel serves both; falling back
// to the type-level rightmost-overload rule ignored the args
declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = f(5).at(0);

// deeper qualification resolves through the same channel
declare namespace Outer { namespace Sub {
  function d(x: number): number[];
  function d(x: string): string;
} }
declare const f2: typeof Outer.Sub.d;
export const viaDeepQualified = f2(5).includes(1);

// a top-typed first arm (`unknown`) accepts every argument, so an undiscriminating arg still
// resolves the call to it - TS first-match
declare namespace NS2 {
  function w(x: unknown): number[];
  function w(x: string): string;
}
declare const f3: typeof NS2.w;
export const viaTopFirstArm = f3(opaque).at(0);

// a divergent set whose first arm the arg-match cannot weigh (`object`) WIDENS to the generic
// helper instead of handing back one arm's type-specific dispatcher
declare namespace NS3 {
  function w(x: object): number[];
  function w(x: string): string;
}
declare const f4: typeof NS3.w;
export const viaDivergentWiden = f4(opaque).at(0);
