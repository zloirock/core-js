// A member read off a realm selection whose left names a constructor the data subset carries decides it, whatever
// that constructor's own entry - excluded here - so the static the build serves names the read, the right naming a
// global or not (`Fallback`, `Object`), in the destructure twin alike. A left that may be absent (a probe of
// `window`) keeps the selection.
export const either = (globalThis.Map || Fallback).groupBy([1, 2], x => x % 2);
export const nullish = (globalThis.Map ?? Object).groupBy([3], x => x);
const { groupBy } = globalThis.Map || Fallback;
export const twin = groupBy;
export const probed = (globalThis.window?.Map || Fallback).groupBy([4], x => x);
