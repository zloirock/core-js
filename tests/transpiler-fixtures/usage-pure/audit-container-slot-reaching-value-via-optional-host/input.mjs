// an OPTIONAL host spelling bails the same way once the slot is written
const cO = { k: Object };
cO.k = Promise;
const { race: viaOptionalHost } = cO?.k;
export { viaOptionalHost };
