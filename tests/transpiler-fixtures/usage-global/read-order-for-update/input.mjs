// The loop body writes the global before the update reads it.
let r;
const Shim = function Shim() {};
const out = [];
for (let i = 0; i < 1; out[out.length] = Promise === Shim, i++) {
  globalThis.Promise = Shim;
}
r = out;
use(r);
