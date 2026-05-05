// `Awaited<Promise<X> & Promise<Y>>` distributes both Promise branches.
// foldIntersectionTypes returns first non-Object match - X (number[]) survives,
// Y (string[]) also survives but intersection of disjoint Array<number> and
// Array<string> can't fold cleanly. lock conservative behavior: when both branches
// resolve to Array, intersection returns the first one (or null if disjoint inners
// can't be reconciled). distinct methods per line for observable dispatch
async function twoProm() {
  type T = Promise<number[]> & Promise<string[]>;
  declare const r: Awaited<T>;
  r.at(0);
  r.includes(1);
}
twoProm();
