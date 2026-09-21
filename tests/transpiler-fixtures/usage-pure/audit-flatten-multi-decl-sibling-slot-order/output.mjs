import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// Nested statics, residual reads and plain siblings retain their source declaration order.
const a = effA(),
  {
    Map: {
      groupBy
    }
  } = {
    Map: {
      groupBy: _Map$groupBy
    }
  },
  b = effB();
const c = effC(),
  {
    Promise: {
      try: tryFn,
      customP
    }
  } = {
    Promise: {
      try: _Promise$try,
      customP: _Promise.customP
    }
  };
console.log(a, groupBy, b, c, tryFn, customP);