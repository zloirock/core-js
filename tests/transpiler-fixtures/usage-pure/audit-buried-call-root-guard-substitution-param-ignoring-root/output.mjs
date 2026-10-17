import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// a callee that IGNORES its parameter yields the same value for every argument, so the root proves
// like the no-param spelling; a callee that READS its parameter proves only what the ARGUMENT is
const ignores = x => _globalThis;
export const paramIgnoringRoot = null == ignores(1).window ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);