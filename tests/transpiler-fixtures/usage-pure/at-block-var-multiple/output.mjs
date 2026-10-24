import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
{
  var O = [];
  _findLastMaybeArray(O).call(O, x => x);
}
{
  var O = {};
  O.at(42);
}
{
  var O = [];
  _flatMaybeArray(O).call(O);
}