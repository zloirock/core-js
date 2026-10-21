import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{
  Symbol: VB
}] = [_globalThis];
var [{
  Promise: VB
}] = [_globalThis];
export const viaVarRedecl = _Promise$try(fn);