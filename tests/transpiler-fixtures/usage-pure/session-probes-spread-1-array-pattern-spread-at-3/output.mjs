import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const rest = [];
{
  const [x] = [...[[1]], ...rest];
  _atMaybeArray(x).call(x, 0);
}