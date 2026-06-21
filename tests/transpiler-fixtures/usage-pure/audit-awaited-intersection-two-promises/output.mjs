import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Awaited<Promise<X> & Promise<Y>>` distributes both Promise branches; both resolve to
// Array with disjoint inners (number[] vs string[]) that can't fold cleanly. lock the
// conservative outcome: intersection keeps the first Array branch (X). distinct methods
// per line so the import set shows observable dispatch
async function twoProm() {
  type T = Promise<number[]> & Promise<string[]>;
  declare const r: Awaited<T>;
  _atMaybeArray(r).call(r, 0);
  _includesMaybeArray(r).call(r, 1);
}
twoProm();