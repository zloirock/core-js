// A clean literal container keeps its native Iterator.from read.
// Its stored Iterator uses the full entry so that native read still has the static.
const clean = { S: Iterator };
const { S: { from } } = clean;
export const viaClean = from([3, 4]);
