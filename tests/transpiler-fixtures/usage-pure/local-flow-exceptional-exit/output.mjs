import _at from "@core-js/pure/actual/instance/at";
// A caught throw can bypass the assignment and preserve the old array.
export function read(flag: boolean) {
  let value: string | string[] = ["old"];
  try {
    if (flag) throw new Error("stop");
    value = "ab";
  } catch {}
  return _at(value).call(value, 0);
}