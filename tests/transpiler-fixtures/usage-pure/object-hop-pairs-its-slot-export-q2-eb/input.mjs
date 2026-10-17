// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
export const [eb, { at: exportFlatInSlot }] = [tick(2), tick([3, 4])], exportQ2 = ticks;
