import _globalThis from "@core-js/pure/actual/global-this";
// Quiet realm mutation receivers still collapse across delete, update, loop and assignment hosts.
// An effectful realm key keeps its native write target and effect.
let e = 0;
delete _globalThis.Set;
_globalThis.Map++;
for (_globalThis.WeakSet of [function () {}]) {}
delete _globalThis[e++, 'window'].WeakMap;
_globalThis.Promise = function () {};
let f = 0;
(f++, _globalThis).Symbol = function () {};
(f++, _globalThis).BigInt += 1;