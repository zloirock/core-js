// reaching-definition key recovery must treat a NESTED slot default as ambiguous: `K` is `o.k.K`
// when `o.k` is present, only `'of'` when the slot defaults - so `Array[K]` must stay NATIVE, never
// fold to `Array.of` (a silent wrong value when the runtime key is `'from'`). a top-level default
// already bails the fold; the nested default has to bail identically rather than slip past the gate
function pick(o) {
  let K = 'from';
  ({ k: { K } = { K: 'of' } } = o);
  return Array[K];
}
export const made = pick({ k: { K: 'from' } });
