import "core-js/modules/es.string.at";
// The inner binding owns this join; the outer array supplies no value to it.
export function read(flag: boolean) {
  const value = ["outer"];
  {
    let value: string | string[];
    if (flag) value = "ab";else value = "cd";
    return value.at(0);
  }
}