import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the iterator key the regenerator helpers, `regenerator-runtime` and immutable spell - a `||` / `??`
// whose left is the well-known symbol through a decided `&&`, an alias of one, a static read off a
// decided realm selection or the symbol itself - always takes the left: the build serves that symbol,
// and a symbol is truthy. so each read is the iterator method, as `Symbol.iterator` spelled in the
// member is, and a static read off the realm selection names the symbol in a member key and in `in`.
// a realm the test may leave `{}`, and a string that only spells the name, keep the read native
function _regenerator() {
  var r = _Symbol,
    n = _Symbol$iterator;
  return function (e) {
    return _getIteratorMethod(e);
  };
}
export const regeneratorRead = _regenerator();
export function _regeneratorValues(e) {
  return _getIteratorMethod(e);
}
var $Symbol = _Symbol;
var iteratorSymbol = _Symbol$iterator;
export const runtimeRead = iterable => _getIteratorMethod(iterable);
var REAL_ITERATOR_SYMBOL = _Symbol$iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
export const immutableRead = iterable => _getIteratorMethod(iterable);
const nullishKey = _Symbol$iterator;
export const nullishRead = receiver => _getIteratorMethod(receiver);
const orKey = _Symbol$iterator;
export const orRead = receiver => _getIteratorMethod(receiver);
const realm = _Symbol;
export const memberRead = receiver => _getIteratorMethod(receiver);
export const memberIn = receiver => _isIterable(receiver);
const maybeRealm = flag ? _Symbol : {};
const undecidedKey = maybeRealm.iterator || '@@iterator';
export const undecidedRead = receiver => receiver[undecidedKey];
const spelledKey = 'Symbol.iterator' || '@@iterator';
export const spelledRead = receiver => receiver[spelledKey];