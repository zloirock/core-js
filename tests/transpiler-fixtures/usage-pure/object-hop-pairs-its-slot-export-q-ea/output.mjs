import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
const _ref = {
  ea: tick(1),
  w: tick([1, 2])
};
const {
  ea
} = _ref;
const exportInSlot = _atMaybeArray(_ref.w);
const exportQ = 2;
export { ea, exportInSlot, exportQ };