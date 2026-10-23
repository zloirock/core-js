import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A branch without an else keeps the initializer as a live alternative.
export function read(flag: boolean) {
  let value: string | string[] = "ab";
  if (flag) value = ["cd"];
  return value.at(0);
}