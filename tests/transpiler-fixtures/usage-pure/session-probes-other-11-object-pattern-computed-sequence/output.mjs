import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const k = 'k';
{
  var t = 0,
    a = (k++, _atMaybeArray([1]));
}
{
  var a = (k++, _atMaybeArray([1])),
    t = 0;
}