import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A computed Symbol.iterator key retains its own extraction path under a constructor.
// The ordinary instance capture must not replace that path; the key effect runs once.
let method;
({
  [(effect(), _Symbol$iterator)]: method
} = _Set);
use(method);