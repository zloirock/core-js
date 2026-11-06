import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
const k = 'k';
{
  const s = (k(), _atMaybeArray(arr)),
    f = (k2(), _flatMaybeArray(arr)),
    {
      z
    } = arr;
  s(z, f);
}
{
  const a = _at(id(arr));
}