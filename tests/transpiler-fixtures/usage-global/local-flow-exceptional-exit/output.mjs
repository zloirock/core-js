import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A caught throw can bypass the assignment and preserve the old array.
export function read(flag: boolean) {
  let value: string | string[] = ["old"];
  try {
    if (flag) throw new Error("stop");
    value = "ab";
  } catch {}
  return value.at(0);
}