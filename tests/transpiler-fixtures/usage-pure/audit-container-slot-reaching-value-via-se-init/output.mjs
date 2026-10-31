import _String$raw from "@core-js/pure/actual/string/raw";
// a CLEAN container behind an SE prefix still extracts - the effect stays put
let seCount = 0;
const seFx = () => seCount++;
const cse = {
  k: String
};
seFx();
const viaSeInit = _String$raw;
export { viaSeInit };