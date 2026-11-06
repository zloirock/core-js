import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A served static decides the initializer before its value joins later writes.
export function read(flag) {
  let value = "ab";
  if (flag) value = "cd";
  return _includesMaybeString(value).call(value, "a");
}