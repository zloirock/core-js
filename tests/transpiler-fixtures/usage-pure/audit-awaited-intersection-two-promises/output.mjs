import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Awaited<Promise<X> & Promise<Y>>` distributes both Promise branches.
// foldIntersectionTypes returns first non-Object match - X (number[]) survives,
// Y (string[]) also survives but intersection of disjoint Array<number> and
// Array<string> can't fold cleanly. lock conservative behavior: when both branches
// resolve to Array, intersection returns the first one (or null if disjoint inners
// can't be reconciled). distinct methods per line for observable dispatch
async function twoProm() {
  type T = Promise<number[]> & Promise<string[]>;
  declare const r: Awaited<T>;
  _atMaybeArray(r).call(r, 0);
  _includesMaybeArray(r).call(r, 1);
}
twoProm();