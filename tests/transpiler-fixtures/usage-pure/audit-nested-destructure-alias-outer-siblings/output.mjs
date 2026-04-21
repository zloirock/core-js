import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const from = _Array$from;
// outer pattern has siblings — `{ Array: { from }, Symbol } = globalThis`. flatten
// extracts `const from = _Array$from` above the declaration and drops the now-empty
// inner pattern plus the outer `Array:` property. `Symbol` remains in a single-sibling
// outer destructure which the existing top-level proxy-global path rewrites to
// `const Symbol = _Symbol`
const Symbol = _Symbol;
from([1]);
_Symbol$iterator;