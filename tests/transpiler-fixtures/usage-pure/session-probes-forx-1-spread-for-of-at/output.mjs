import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
{
  const arr = [...[[1], [2]]];
  for (const e of arr) _atMaybeArray(e).call(e, 0);
}