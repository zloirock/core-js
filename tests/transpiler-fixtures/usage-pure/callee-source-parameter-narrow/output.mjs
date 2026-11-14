import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
(_pushMaybeArray(out) || 0).call(out, (P => _Promise$allSettled)(_Promise));
r = typeof out[0];
export { r, effects };