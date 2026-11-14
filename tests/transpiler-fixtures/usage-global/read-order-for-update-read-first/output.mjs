import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
// Inside an update, a read still precedes a later write in the same sequence.
let r;
const Shim = function Shim() {};
const out = [];
for (let i = 0; i < 1; out[out.length] = Promise === Shim, globalThis.Promise = Shim, i++) {}
r = out;
use(r);