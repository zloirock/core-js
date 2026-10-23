// Both reaching families remain live at the read.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = "a";else value = ["b"];
  return value.at(0);
}
