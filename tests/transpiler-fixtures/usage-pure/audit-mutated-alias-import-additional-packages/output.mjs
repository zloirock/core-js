import _Array$from from "@core-js/pure/actual/array/from";
// a global-proxy entry aliased through a USER package (additionalPackages) is the same
// mutation host as the first-party spelling: a patch through it must deopt the slot
// instead of being substituted over
import g from 'my-core-js/actual/global-this';
g.Map = class PatchedMap extends Map {};
export const patched = Map.groupBy([1], x => x);
// an untouched builtin keeps its substitution - the deopt is per-name
export const control = _Array$from('ab');