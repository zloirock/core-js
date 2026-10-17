// a same-name `var` redeclaration MERGES its per-binding entries (last write's hint serves the
// use - runtime last-write-wins); a CONDITIONAL `var` refuses flow-trust and folds through the
// runtime constructor guard instead, keeping the untaken path faithful
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{ Symbol: VB }] = [globalThis];
var [{ Promise: VB }] = [globalThis];
export const viaVarRedecl = VB.try(fn);
