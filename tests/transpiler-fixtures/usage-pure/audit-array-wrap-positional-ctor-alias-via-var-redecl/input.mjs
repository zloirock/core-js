// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{ Symbol: VB }] = [globalThis];
var [{ Promise: VB }] = [globalThis];
export const viaVarRedecl = VB.try(fn);
