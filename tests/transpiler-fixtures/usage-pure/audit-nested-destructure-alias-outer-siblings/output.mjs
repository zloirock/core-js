import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// outer pattern has siblings - `{ Array: { from }, Symbol } = globalThis`: the receiver is mirrored with the pure
// imports in its slots, so a static read off the bound `Symbol` respells too - standing alone as a statement it
// performs nothing and leaves, while a value keeps it
const {
  Array: {
    from
  },
  Symbol
} = {
  Array: {
    from: _Array$from
  },
  Symbol: _Symbol
};
from([1]);
export const iterator = _Symbol$iterator;