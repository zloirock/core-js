// Successive var declarations merge the binding while the latest realm property supplies its hint.
// The native patterns remain and the later Promise.try call receives its polyfill.
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{ Symbol: VB }] = [globalThis];
var [{ Promise: VB }] = [globalThis];
export const viaVarRedecl = VB.try(fn);
