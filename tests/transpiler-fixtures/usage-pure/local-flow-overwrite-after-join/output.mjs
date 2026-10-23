import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The later unconditional write replaces both earlier branches.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = "ab";else value = "cd";
  value = ["ef"];
  return _atMaybeArray(value).call(value, 0);
}