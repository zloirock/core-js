import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
{
  var _ref;
  const box = [[1]];
  const [a] = [...[box]];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref = box[0]).call(_ref, 0);
}