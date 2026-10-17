import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
{
  // The computed outer key runs before the nested prototype read and instance-method extraction.
  const order = [];
  const eff = t => (_pushMaybeArray(order).call(order, t), t);
  const {
    [(eff('k'), 'Array')]: _ref
  } = _globalThis;
  const f2 = _valuesMaybeArray(_ref.prototype);
}