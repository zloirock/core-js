import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// Inside an update, a read still precedes a later write in the same sequence.
let r;
const Shim = function Shim() {};
const out = [];
for (let i = 0; i < 1; out[out.length] = _Promise === Shim, _globalThis.Promise = Shim, i++) {}
r = out;
use(r);