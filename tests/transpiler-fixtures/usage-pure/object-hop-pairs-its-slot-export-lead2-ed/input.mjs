// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
export const exportLead2 = tick(4), { w: { at: exportHopBehindLead }, ed } = { w: tick([7, 8]), ed: 1 };
