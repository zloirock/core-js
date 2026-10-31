import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
{
  // The receiver is evaluated once; key conversion precedes the method binding and the sibling read.
  const order = [];
  function eff(t) {
    _pushMaybeArray(order).call(order, t);
    return t;
  }
  const _ref = [1, 2],
    a = (eff('k'), _atMaybeArray(_ref)),
    {
      z
    } = _ref;
}