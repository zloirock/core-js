// a CLEAN container behind an SE prefix still extracts - the effect stays put
let seCount = 0;
const seFx = () => seCount++;
const cse = { k: String };
const { raw: viaSeInit } = (seFx(), cse.k);
export { viaSeInit };
