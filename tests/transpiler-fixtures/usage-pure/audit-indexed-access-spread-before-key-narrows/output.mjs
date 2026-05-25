import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// positive control: `{...spread, k: literal}` - the explicit `k: [1,2,3]` comes AFTER the
// spread, so it wins as the LATEST property assignment. without the backward iteration
// fix this case used to BAIL on the first SpreadElement and fall back to the constraint;
// the fix lets T['k'] resolve to the literal `[1,2,3]` for narrower-than-constraint shapes
declare const spread: {
  other: string;
};
function pick<T extends {
  k: unknown;
}>(o: T): T['k'] {
  return o.k;
}
const r = pick({
  ...spread,
  k: [1, 2, 3]
});
_atMaybeArray(r).call(r, -1);