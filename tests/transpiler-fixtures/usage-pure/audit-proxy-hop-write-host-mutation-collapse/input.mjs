// Quiet realm mutation receivers still collapse across delete, update, loop and assignment hosts.
// An effectful realm key keeps its native write target and effect.
let e = 0;
delete globalThis.window.Set;
globalThis.window.Map++;
for (globalThis.window.WeakSet of [function () {}]) {}
delete globalThis[(e++, 'window')].WeakMap;
(0, globalThis.window).Promise = function () {};
let f = 0;
(f++, globalThis.window).Symbol = function () {};
(f++, globalThis.window).BigInt += 1;
