import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _getIterator from "@core-js/pure/actual/get-iterator";
// computed key with optional access on `Symbol?.iterator`: the well-known symbol must
// still be recognised through the optional access form.
const obj = {};
_getIteratorMethod(obj);
_getIterator(obj);