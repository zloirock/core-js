import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
{
  var _ref;
  const box = [1];
  const [, ...r] = [...[0, box]];
  _pushMaybeArray(_ref = r[0]).call(_ref, 2);
  _atMaybeArray(box).call(box, 0);
}