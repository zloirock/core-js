import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A member read off a realm selection whose left names a constructor the data subset carries decides it, whatever
// that constructor's own entry - excluded here - so the static the build serves names the read, the right naming a
// global or not (`Fallback`, `Object`), in the destructure twin alike. A left that may be absent (a probe of
// `window`) keeps the selection.
export const either = _Map$groupBy([1, 2], x => x % 2);
export const nullish = _Map$groupBy([3], x => x);
const groupBy = _Map$groupBy;
export const twin = groupBy;
export const probed = (_globalThis.window?.Map || Fallback).groupBy([4], x => x);