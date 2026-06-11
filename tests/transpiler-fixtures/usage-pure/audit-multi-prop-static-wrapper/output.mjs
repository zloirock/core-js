import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a shared static-object wrapper: the FIRST prop's in-place literal rewrite leaves a
// polyfill stub (`b: _Promise`) that the SIBLING prop's walk must see through via the
// injector hint - without recovery the sibling bound off the stub (unbound at runtime
// where native requires the constructor receiver)
const w = {
  a: Array,
  b: _Promise
};
const from = _Array$from;
const resolve = _Promise$resolve;
from([1]);
resolve(2);