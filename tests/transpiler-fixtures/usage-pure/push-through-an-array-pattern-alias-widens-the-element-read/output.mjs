import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// a push through a binding an array pattern takes off a wrapper holding the array reaches that array: a
// pushed string widens the element a later read takes to every family, while the array itself, and an
// element no push reaches, stay typed
const rest = [];
{
  const box = [1];
  const [a] = [...rest, box];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  const box = [1];
  const [a] = [box];
  _pushMaybeArray(a).call(a, 2);
  _atMaybeArray(box).call(box, 0);
}
{
  var _ref;
  const box = [[1]];
  _atMaybeArray(_ref = box[0]).call(_ref, 0);
}
{
  var _ref2;
  const box = [[1]];
  const [a] = [...rest, box];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref2 = box[0]).call(_ref2, 0);
}
{
  var _ref3;
  const box = [[1]];
  const [a] = [box];
  _pushMaybeArray(a).call(a, 's');
  _at(_ref3 = box[0]).call(_ref3, 0);
}