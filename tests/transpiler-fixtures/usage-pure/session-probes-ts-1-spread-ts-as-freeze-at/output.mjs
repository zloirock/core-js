import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const v = _Object$freeze(...([[1, 2]] as any));
  _atMaybeArray(v).call(v, 0);
}