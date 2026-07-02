import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
// TSInstantiationExpression wraps a runtime identifier: the polyfill must still recognize
// the identifier inside. Use `(Array<number>).from(x)` per parser restriction.
const f = _Array$from([1, 2]);
const m = new _Map();