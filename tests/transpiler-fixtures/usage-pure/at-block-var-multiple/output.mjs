import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  var O = [];
  _atMaybeArray(O).call(O, 42);
}
{
  var O = {};
  O.at(42);
}
{
  var O = [];
  _atMaybeArray(O).call(O, 42);
}