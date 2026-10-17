import _globalThis from "@core-js/pure/actual/global-this";
import _Number$EPSILON from "@core-js/pure/actual/number/epsilon";
const seed = null;
export const nullishRight = seed ?? (null == _globalThis.window ? void 0 : _Number$EPSILON);