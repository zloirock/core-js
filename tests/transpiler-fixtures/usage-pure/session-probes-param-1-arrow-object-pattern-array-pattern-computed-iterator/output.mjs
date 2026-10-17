import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
{
  const r = (({
    a: [{
      [_Symbol$iterator]: i1
    }],
    b: [{
      [_Symbol$iterator]: i2
    }]
  }) => [i1, i2])({
    a: [{
      [_Symbol$iterator]: _getIteratorMethod([1])
    }],
    b: [{
      [_Symbol$iterator]: _getIteratorMethod('s')
    }]
  });
}