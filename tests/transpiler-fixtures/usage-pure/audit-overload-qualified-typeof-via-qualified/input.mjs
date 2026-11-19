// a call through an aliased QUALIFIED `typeof NS.fn` arg-discriminates the overload set
// exactly like the bare `typeof fn` form - the segments channel serves both; falling back
// to the type-level rightmost-overload rule ignored the args
declare namespace NS {
  function q(x: number): number[];
  function q(x: string): string;
}
declare const f: typeof NS.q;
export const viaQualified = f(5).at(0);
