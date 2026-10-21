import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
{
  const order = [];
  const eff = t => (_pushMaybeArray(order).call(order, t), t);
  const {
    [(eff('k'), 'w')]: {
      from: f4
    }
  } = {
    w: Array
  };
}