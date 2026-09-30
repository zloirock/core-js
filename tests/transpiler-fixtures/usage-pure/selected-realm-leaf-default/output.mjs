import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A stored all-realm selection retains its write and uses the shared leaf-default route.
// A falsy left operand still throws when the nested pattern reads its missing receiver.
let stored;
const {
  Array: {
    from = _Array$from
  }
} = stored = flag && _globalThis;
use(from, stored);