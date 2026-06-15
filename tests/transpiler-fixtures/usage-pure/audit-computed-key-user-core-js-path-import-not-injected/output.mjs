import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// A user default import whose source merely CONTAINS the `core-js` substring is NOT a
// plugin-injected pure reference - it stays a stable in-scope value, so a per-branch synth
// receiver (`cond ? Array : Set`, which has no body-extract fallback) must still mirror the
// sibling shorthand polyfill into the synth literal rather than dropping it
import KEY from 'a-core-js-helper';
export function pick(cond) {
  const {
    [KEY]: own,
    from
  } = cond ? {
    [KEY]: Array[KEY],
    from: _Array$from
  } : _Set;
  return [own, from];
}