import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Successive var declarations merge the binding while the latest realm property supplies its hint.
// The native patterns remain and the later Promise.try call receives its polyfill.
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{
  Symbol: VB
}] = [_globalThis];
var [{
  Promise: VB
}] = [_globalThis];
export const viaVarRedecl = _Promise$try(fn);