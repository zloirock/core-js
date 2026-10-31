import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A captured assignment result cannot be replaced by its extracted method.
let method;
const captured = {
  [(effect(), _Symbol$iterator)]: method = fallback()
} = _globalThis;