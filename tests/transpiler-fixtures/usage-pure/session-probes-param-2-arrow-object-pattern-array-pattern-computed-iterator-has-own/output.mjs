import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
{
  const r = (({
    w: [{
      [_Symbol$iterator]: it,
      hasOwn
    }]
  }) => [it, hasOwn])({
    w: [{
      [_Symbol$iterator]: _getIteratorMethod(Object),
      hasOwn: _Object$hasOwn
    }]
  });
}