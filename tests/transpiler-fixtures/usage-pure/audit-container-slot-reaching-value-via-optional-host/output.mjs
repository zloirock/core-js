import _Promise from "@core-js/pure/actual/promise";
// an OPTIONAL host spelling bails the same way once the slot is written
const cO = {
  k: Object
};
cO.k = _Promise;
const {
  race: viaOptionalHost
} = cO?.k;
export { viaOptionalHost };