import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// a SEALED probe nav under a claim the RECEIVER channel erases: `(nav).Map` collapses to the
// ponyfill ctor and the dispatch above reads off it, dropping the read the source performs on the
// sealed value. that read comes back as a throw probe, the same one the claim channel emits for
// every shape that keeps its receiver - the rows below enumerate both families
export const instanceOnCtor = _nameMaybeFunction(((null == _globalThis.window ? void 0 : _self).Map, _Map));