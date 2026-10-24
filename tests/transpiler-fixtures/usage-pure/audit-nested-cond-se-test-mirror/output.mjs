import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// an EFFECTFUL ternary test must keep running: the flatten bails (it would drop the test),
// the mirror unfolds both branches, and the native test picks per evaluation
let log = [];
let c = true;
const {
  Array: {
    from
  }
} = (_pushMaybeArray(log).call(log, 1), c) ? {
  Array: {
    from: _Array$from
  }
} : {
  Array: {
    from: _Array$from
  }
};
from([1]);