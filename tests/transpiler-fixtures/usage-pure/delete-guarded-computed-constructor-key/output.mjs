import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// The short-circuited delete returns true without executing the computed constructor key.
export const removed = null == _globalThis.window ? true : delete (key(), _Map).missing;