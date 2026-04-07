import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$from from "@core-js/pure/actual/array/from";
let log = [];
const a = _pushMaybeArray(log).call(log, 'a'),
  from = _Array$from,
  b = _pushMaybeArray(log).call(log, 'b');