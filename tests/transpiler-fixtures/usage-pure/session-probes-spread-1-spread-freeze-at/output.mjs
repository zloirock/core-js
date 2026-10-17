import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
{
  const v = _Object$freeze(...[[1, 2]]);
  _atMaybeArray(v).call(v, 0);
}