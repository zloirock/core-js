import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
{
  const order = [];
  const eff = t => (_pushMaybeArray(order).call(order, t), t);
  const {
    [(eff('k'), 'Array')]: {
      from: f1
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
}