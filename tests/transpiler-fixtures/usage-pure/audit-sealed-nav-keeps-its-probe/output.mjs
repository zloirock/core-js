import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a SEAL over a navigation - a source paren, and the TS cast that reads the same way - is printer
// trivia to the probe question: the nav still owes its environment probe, and reading the sealed node
// raw answered "no live `?.`" for it. the dead-ctor swap then handed back the always-defined ponyfill
// where the source yields undefined on a host without the hop. the unsealed twin is the reference
let out, sealed, plain;
plain = null == _globalThis.window ? void 0 : _atMaybeArray(_self.Array.prototype);
sealed = null == _globalThis.window ? void 0 : _atMaybeArray(_self.Array.prototype);
out = [plain, sealed];
export const read = out;