import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
{
  var _ref;
  const r = (({
    a: {
      [_Symbol$iterator]: it,
      at
    }
  }) => [it, at])({
    a: (_ref = [1], {
      [_Symbol$iterator]: _getIteratorMethod(_ref),
      at: _atMaybeArray(_ref)
    })
  });
}