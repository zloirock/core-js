import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Multiple constructor bindings from one array pattern retain separate identities.
// The later Promise.resolve read resolves through the second binding without rewriting the wrapper.
const [{
  Symbol: SM
}, {
  Promise: MG
}] = [_globalThis, _globalThis];
export const viaMultiExtractSecond = _Promise$resolve(ready);