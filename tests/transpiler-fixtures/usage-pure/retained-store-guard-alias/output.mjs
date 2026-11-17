import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// A retained guard writes the source receiver before the sealed read. A later alias
// may select the polyfill only for the realm value; a user write invalidates that source.
let held;
export const first = ((null == (held = _globalThis.window) ? void 0 : _self).Array, _Array$from)([1]);
export const second = held === _globalThis ? _Map : held?.Map;
held = other;
export const changed = held?.Set;