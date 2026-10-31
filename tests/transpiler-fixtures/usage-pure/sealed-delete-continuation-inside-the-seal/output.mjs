import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A `delete` through a seal over a probe navigation keeps its guard on the probe, and the `?.` re-hung past the
// guard opens a chain that runs to the top of the continuation inside the seal - through member, call and
// non-null links alike: a short-circuit ends at the seal, where the source's own `?.` ended.
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const viaMember = delete ((null == _globalThis.window ? void 0 : _self)?.box.k).n;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const viaCall = delete ((null == _globalThis.window ? void 0 : _self)?.box.f()).n;
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const viaNonNull = delete ((null == _globalThis.window ? void 0 : _self)?.box!.k).n;