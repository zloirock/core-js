import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  let O = [];
  _atMaybeArray(O).call(O, 42);
}
{
  let O = {};
  O.at(42);
}
{
  let O = [];
  _atMaybeArray(O).call(O, 42);
}