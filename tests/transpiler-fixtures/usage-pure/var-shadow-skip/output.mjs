import _at from "@core-js/pure/actual/instance/at";
// top-level `var Array` / `var Promise` shadow the globals: `Array.from(...)` and
// `new Promise(...)` resolve to the local bindings, polyfill emission is skipped for them.
// The trailing `.at.call(y, -1)` is still rewritten via instance-method dispatch, which
// ignores the receiver binding and relies on the called name only.
var Array = require('./array');
var Promise = require('./promise');
Array.from(x);
new Promise(fn);
_at(Array.prototype).call(y, -1);