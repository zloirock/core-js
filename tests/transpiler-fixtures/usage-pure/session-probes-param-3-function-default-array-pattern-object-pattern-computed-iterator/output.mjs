import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
{
  function g([{
    [_Symbol$iterator]: it
  }] = [{
    [_Symbol$iterator]: _getIteratorMethod([1])
  }]) {
    return it;
  }
}