import _globalThis from "@core-js/pure/actual/global-this";
// chain-assignment + proxy key - the assignment replays whole (binding update observable)
let q;
const {
  location: loc
} = (q = _globalThis, _globalThis);
export const r = [q, loc];