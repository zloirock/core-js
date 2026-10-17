// ... and under an EXPORT the joined declaration keeps its wrapper, the extraction exported with it -
// the in-slot write still runs in the residual ahead of the dispatch that reads it
let ticks = 0;
function tick(value) {
  ticks += 1;
  return value;
}
// ... and a hoisted memo behind a LEADING sibling's own init stays behind it under the wrapper as well
export const exportLead = tick(3), [{ at: exportBehindLead }, ec] = [tick([5, 6]), 1];
