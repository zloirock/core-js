import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A complete join supplies the local value without a declaration annotation.
export function read(flag: boolean) {
  let value;
  if (flag) value = "ab";else value = "cd";
  return _atMaybeString(value).call(value, 0);
}