import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a bodyless `var` over a selection the build decides drains the part of it that runs - the effect
// prefix, then the read - and nothing of the dead part
export function pick(ready) {
  if (ready) {
    console.log();
    var from = _Array$from;
  }
  if (ready) {
    console.log();
    var groupBy = _Map$groupBy;
  }
  return [from, groupBy];
}