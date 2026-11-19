import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// The iterator key the regenerator helpers, `regenerator-runtime` and immutable spell - a `||` / `??` whose left is the well-known
// symbol through a decided `&&`, an alias of one, a static read off a decided realm selection or the symbol itself - always takes
// the left: the build serves that symbol, and a symbol is truthy.
function _regenerator() {
  var r = _Symbol,
    n = _Symbol$iterator;
  return function (e) {
    return _getIteratorMethod(e);
  };
}
export const regeneratorRead = _regenerator();