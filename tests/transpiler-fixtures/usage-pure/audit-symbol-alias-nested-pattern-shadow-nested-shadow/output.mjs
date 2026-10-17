import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const iterator = _Symbol$iterator;
export function nestedShadow() {
  const {
    constructor: {
      iterator
    }
  } = _Symbol;
  return [3, 4][iterator];
}