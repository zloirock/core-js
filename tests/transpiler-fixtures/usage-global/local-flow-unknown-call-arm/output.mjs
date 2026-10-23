import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The called source may return either family; its alternatives cannot disappear.
export function read(flag: boolean, source: () => string | string[]) {
  let value: string | string[] = "ab";
  if (flag) value = source();
  return value.at(0);
}