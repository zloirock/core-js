import _globalThis from "@core-js/pure/actual/global-this";
// A var redeclaration can reuse one binding for successive realm properties.
// The wrapper patterns stay native without turning the declarations themselves into writes.
/* eslint-disable no-redeclare, vars-on-top, block-scoped-var -- redeclaration shapes under test */
var [{
  Symbol: VB
}] = [_globalThis];
var [{
  Promise: VB
}] = [_globalThis];