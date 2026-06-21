// `Awaited<Promise<X> & Promise<Y>>` distributes both Promise branches; both resolve to
// Array with disjoint inners (number[] vs string[]) that can't fold cleanly. lock the
// conservative outcome: intersection keeps the first Array branch (X). distinct methods
// per line so the import set shows observable dispatch
async function twoProm() {
  type T = Promise<number[]> & Promise<string[]>;
  declare const r: Awaited<T>;
  r.at(0);
  r.includes(1);
}
twoProm();
