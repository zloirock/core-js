import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
const exportLead2 = tick(4);
const _ref = {
  w: tick([7, 8]),
  ed: 1
};
const exportHopBehindLead = _atMaybeArray(_ref.w);
const {
  ed
} = _ref;
export { exportLead2, exportHopBehindLead, ed };