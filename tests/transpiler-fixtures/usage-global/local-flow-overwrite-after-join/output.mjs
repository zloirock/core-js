import "core-js/modules/es.array.at";
// The later unconditional write replaces both earlier branches.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = "ab";else value = "cd";
  value = ["ef"];
  return value.at(0);
}