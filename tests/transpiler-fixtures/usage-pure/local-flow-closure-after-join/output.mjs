import _at from "@core-js/pure/actual/instance/at";
// A captured write can run after the join and prevents a same-frame narrow.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = "ab";else value = "cd";
  function mutate() {
    value = ["ef"];
  }
  mutate();
  return _at(value).call(value, 0);
}