import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref;
// `Symbol[Symbol.foo]` references an unknown well-known name; the `in` check must NOT
// polyfill-dispatch since `foo` isn't a recognized Symbol. the inner `Symbol` identifier
// still polyfills on its own. paired with a known-good `Symbol.iterator in obj`
const a = _Symbol[_Symbol.foo] in obj;
const b = _isIterable(obj);
_atMaybeArray(_ref = [a, b]).call(_ref, 0);