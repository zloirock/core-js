import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
{
  const box = [1];
  const [a] = [...[box]];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}