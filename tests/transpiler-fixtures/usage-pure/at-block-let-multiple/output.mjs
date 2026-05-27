import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
{
  let O = [];
  _findLastMaybeArray(O).call(O, x => x);
}
{
  let O = {};
  O.at(42);
}
{
  let O = [];
  _flatMaybeArray(O).call(O);
}