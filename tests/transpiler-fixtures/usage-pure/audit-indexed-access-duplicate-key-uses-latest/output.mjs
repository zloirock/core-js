import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// duplicate-key object literal: `{k: literal1, k: literal2}` evaluates `k = literal2` at
// runtime (last-property-wins). backward iteration picks `literal2` correctly; forward
// iteration would return `literal1` and narrow to the wrong RHS shape (sound only when
// the constraint covers both, but the fixture pinpoints the iteration direction directly)
function pick<T extends {
  k: unknown;
}>(o: T): T['k'] {
  return o.k;
}
const r = pick({
  k: 'string',
  k: [1, 2, 3]
});
_atMaybeArray(r).call(r, -1);