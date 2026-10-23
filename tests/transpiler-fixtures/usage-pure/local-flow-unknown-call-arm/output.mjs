import _at from "@core-js/pure/actual/instance/at";
// The called source may return either family; its alternatives cannot disappear.
export function read(flag: boolean, source: () => string | string[]) {
  let value: string | string[] = "ab";
  if (flag) value = source();
  return _at(value).call(value, 0);
}