// Both branches write arrays, so the broad declaration must not add string dispatch.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = ["a"];else value = ["b"];
  return value.at(0);
}
