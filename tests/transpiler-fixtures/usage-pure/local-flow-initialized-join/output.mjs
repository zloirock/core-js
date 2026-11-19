import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Both branches replace the earlier mixed initializer with arrays.
export function read(flag: boolean) {
  let value = flag ? "old" : ["old"];
  if (flag) value = ["ab"];else value = ["cd"];
  return _atMaybeArray(value).call(value, 0);
}