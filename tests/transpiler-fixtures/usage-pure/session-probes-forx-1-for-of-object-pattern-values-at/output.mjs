import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A loop-body pattern keeps native Object.values and captures the nested array at receiver.
{
  for (const _r of [{
    w: Object,
    y: [1]
  }]) {
    let {
      w: {
        values
      }
    } = _r;
    let at = _atMaybeArray(_r.y);
    [values, at];
  }
}