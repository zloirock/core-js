// Both branches replace the earlier mixed initializer with arrays.
export function read(flag: boolean) {
  let value = flag ? "old" : ["old"];
  if (flag) value = ["ab"];else value = ["cd"];
  return value.at(0);
}
