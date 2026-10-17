import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function eff() {
  return Object;
}
{
  const [x] = [...[[1, 2]], eff()];
  _atMaybeArray(x).call(x, 0);
}