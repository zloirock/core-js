import _at from "@core-js/pure/actual/instance/at";
// multiple SpreadElements with a key BETWEEN them: backward iteration finds the LATER
// spread before the key, bails sound. without the backward iteration this case took the
// FIRST matching key and returned its literal RHS even though both surrounding spreads
// could inject conflicting `k` values
declare const spread1: {
  other: number;
};
declare const spread2: {
  k: string;
};
function pick<T extends {
  k: unknown;
}>(o: T): T['k'] {
  return o.k;
}
const r = pick({
  ...spread1,
  k: [1, 2, 3],
  ...spread2
});
_at(r).call(r, -1);