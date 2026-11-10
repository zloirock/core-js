import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// A replaced constructor needs no native static Get; computed-key effects still run.
let r;
const effects = [];
const a = _Iterator$from,
  b = (_pushMaybeArray(effects).call(effects, 'key'), _Iterator$from);
r = [typeof a, typeof b];