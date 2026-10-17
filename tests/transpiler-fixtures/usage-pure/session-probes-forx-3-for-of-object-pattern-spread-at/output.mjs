import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  for (const {
    x
  } of [...[{
    x: [1]
  }], {
    x: [2]
  }]) _atMaybeArray(x).call(x, 0);
}