// chain-assignment within destructure receiver: `c = (A || B)` evaluates to its right-hand side, which the
// fallback-receiver peel reaches through the store. A left whose constructor entry is excluded (`globalThis.Map`,
// while `groupBy` keeps its own) still decides - the data subset carries `Map` - so the right never runs and leaves
// with its import: the store keeps the left, read raw, and the static is claimed off it beside the store
const { groupBy } = (c = (globalThis.Map || Set));
groupBy;
