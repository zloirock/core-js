// an SE-prefixed init reaches the container member behind the sequence - the effect stays put
let seCount = 0;
const seFx = () => seCount++;
const cse = { k: String };
const { raw: viaSeInit } = (seFx(), cse.k);
export { viaSeInit };
