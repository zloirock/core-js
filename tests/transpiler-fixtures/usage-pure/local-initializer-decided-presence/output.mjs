import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A build-decided initializer contributes only its live value to later local reads.
export function read(flag) {
  let value = "ab";
  if (flag) value = "cd";
  return _atMaybeString(value).call(value, 0);
}