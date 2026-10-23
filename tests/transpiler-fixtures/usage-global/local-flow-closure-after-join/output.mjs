import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A captured write can run after the join and prevents a same-frame narrow.
export function read(flag: boolean) {
  let value: string | string[];
  if (flag) value = "ab";else value = "cd";
  function mutate() {
    value = ["ef"];
  }
  mutate();
  return value.at(0);
}