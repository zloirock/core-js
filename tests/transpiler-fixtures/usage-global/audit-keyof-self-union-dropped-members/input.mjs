// `T[keyof T]` folds every member's VALUE type: a (non-getter) method folds as Function (its
// value, not its return - the single-key `T['method']` mirror), so a method mixed with a
// concrete container BAILS the union to generic instead of narrowing to the survivor; an
// untyped (implicit-any) member absorbs the whole union - generic too. homogeneous containers
// and a getter contributing its return type keep the narrow. distinct method per cell
interface Mixed {
  run(): void;
  xs: number[];
}
declare const v: Mixed[keyof Mixed];
export const r1 = v.at(0);
interface Loose {
  ys: string[];
  blah;
}
declare const w: Loose[keyof Loose];
export const r2 = w.includes("q");
interface Homo {
  as: number[];
  bs: boolean[];
}
declare const h: Homo[keyof Homo];
export const r3 = h.at(1);
interface WithGetter {
  get size(): string[];
  zs: string[];
}
declare const g2: WithGetter[keyof WithGetter];
export const r4 = g2.includes("z");
// methods-only: the union folds to Function, which has no instance helpers at all
interface Fns {
  a(): number;
  b(): string;
}
declare const f: Fns[keyof Fns];
export const r5 = f.at(2);
// runtime analogue through a constrained type param: the untyped member bails the same way
interface LooseC {
  cs: number[];
  loose;
}
export function viaParam<T extends LooseC>(o: T, k: keyof T) {
  return o[k].includes(3);
}
