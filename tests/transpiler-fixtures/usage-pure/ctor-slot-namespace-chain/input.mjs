let sharedSlot;
const chained = sharedSlot = { Map };
const { Map: { groupBy: viaChain }, ...chainRest } = chained;
export const stored = chained === sharedSlot;
export { viaChain, chainRest };
