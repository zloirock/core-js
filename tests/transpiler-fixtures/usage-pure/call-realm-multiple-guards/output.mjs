import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A call-returned realm keeps its environment probe while serving the static.
export const r = null == (() => _globalThis)().window ? void 0 : _Promise$race;