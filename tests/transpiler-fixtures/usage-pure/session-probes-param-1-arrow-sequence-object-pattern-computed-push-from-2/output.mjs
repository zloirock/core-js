import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An effectful outer key stays before its native from read.
// The push inside that key's helper remains independently polyfilled.
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