import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A nested pattern can read the supplied constructor or its different default.
// The default must not hide the raw static read on a substituted source.
let sources = [Array];
let observed;
for (let i = 0; i < 1; i++) {
  sources = [_Map];
  const [{
    groupBy
  } = {
    groupBy: _Object$groupBy
  }] = sources;
  observed = groupBy;
}
export { observed };