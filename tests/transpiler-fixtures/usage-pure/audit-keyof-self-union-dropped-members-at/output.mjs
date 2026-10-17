import _at from "@core-js/pure/actual/instance/at";
// `T[keyof T]` folds every member's VALUE type: a (non-getter) method folds as Function (its value, not its return - the
// single-key `T['method']` mirror), so a method mixed with a concrete container BAILS the union to generic instead of narrowing to
// the survivor; an untyped (implicit-any) member absorbs the whole union - generic too.
interface Mixed {
  run(): void;
  xs: number[];
}
declare const v: Mixed[keyof Mixed];
export const r1 = _at(v).call(v, 0);