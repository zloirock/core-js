import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref;
// `Symbol[Symbol.foo] in obj` - inner Symbol-ref is genuine but the well-known name `foo`
// is not in symbolKeyToEntry. handleBinaryIn's resolveSymbolInEntry would return null and
// the seeding bails, leaving the inner Symbol Identifier free to receive its own polyfill
// (unrelated chain). known-good case `Symbol.iterator` follows for distinct-method parity
const a = _Symbol[_Symbol.foo] in obj;
const b = _isIterable(obj);
_atMaybeArray(_ref = [a, b]).call(_ref, 0);