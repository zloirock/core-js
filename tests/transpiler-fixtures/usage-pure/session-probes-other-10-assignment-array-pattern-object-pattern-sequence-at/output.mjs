import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
{
  let e;
  [,] = [(g(), arr)];
  e = _atMaybeArray(arr);
  use(e);
}