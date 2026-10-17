import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
{
  var _ref, _ref2;
  const box = [[1]];
  const [, ...r] = [...[0, box]];
  _pushMaybeArray(_ref = r[0]).call(_ref, 's');
  _at(_ref2 = box[0]).call(_ref2, 0);
}