import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A computed Symbol.iterator slot stays native under a constructor; its key effect runs once.
let method;
({
  [(effect(), _Symbol$iterator)]: method
} = _Set);
use(method);