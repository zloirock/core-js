// an OPTIONAL host spelling reads the same slot - the walk sees through the `?.`
const cO = { k: Object };
cO.k = Promise;
const { race: viaOptionalHost } = cO?.k;
export { viaOptionalHost };
