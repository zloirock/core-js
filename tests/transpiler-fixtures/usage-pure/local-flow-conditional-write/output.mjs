import _at from "@core-js/pure/actual/instance/at";
// A branch without an else keeps the initializer as a live alternative.
export function read(flag: boolean) {
  let value: string | string[] = "ab";
  if (flag) value = ["cd"];
  return _at(value).call(value, 0);
}