import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// Multiple constructor bindings from one array pattern retain separate identities.
// The later Symbol.for read resolves through the first binding without rewriting the wrapper.
const [{
  Symbol: SM
}, {
  Promise: MG
}] = [_globalThis, _globalThis];
export const viaMultiExtractFirst = _Symbol$for(dedupeKey);