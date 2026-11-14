import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
// The loop body writes the global before the update reads it.
let r;
const Shim = function Shim() {};
const out = [];
for (let i = 0; i < 1; out[out.length] = Promise === Shim, i++) {
  globalThis.Promise = Shim;
}
r = out;
use(r);