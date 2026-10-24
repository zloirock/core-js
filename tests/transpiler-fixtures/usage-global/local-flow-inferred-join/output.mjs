import "core-js/modules/es.string.at";
// A complete join supplies the local value without a declaration annotation.
export function read(flag: boolean) {
  let value;
  if (flag) value = "ab";else value = "cd";
  return value.at(0);
}