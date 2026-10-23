import _at from "@core-js/pure/actual/instance/at";
// Both reaching families remain live at the read.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = "a";else value = ["b"];
  return _at(value).call(value, 0);
}