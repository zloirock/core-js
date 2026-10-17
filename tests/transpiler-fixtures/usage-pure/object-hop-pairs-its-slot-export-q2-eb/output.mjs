import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
const [_ref, _ref2] = [tick(2), tick([3, 4])],
  eb = _ref,
  exportFlatInSlot = _atMaybeArray(_ref2),
  exportQ2 = ticks;
export { eb, exportFlatInSlot, exportQ2 };