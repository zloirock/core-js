import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
// the realm's own install under a presence test the build decides never runs, so the realm keeps naming
// the global object: a read off it, through a hop or through an alias takes the pure import
if (typeof _globalThis == 'undefined') window.globalThis = window;
export const grouped = _Map$groupBy(list, key);
export const tried = _Promise$try(f);
const g = _globalThis;
export const iter = _Iterator$from(list);