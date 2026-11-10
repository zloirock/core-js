import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A replaced constructor needs no native static Get; computed-key effects still run.
let r;
const effects = [];
const a = _Promise$resolve,
  b = (_pushMaybeArray(effects).call(effects, 'key'), _Promise$reject);
r = [typeof a, typeof b];