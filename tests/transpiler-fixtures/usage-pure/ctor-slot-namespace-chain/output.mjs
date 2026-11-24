import _Map from "@core-js/pure/actual/map";
let sharedSlot;
const chained = sharedSlot = {
  Map: _Map
};
const {
  Map: {
    groupBy: viaChain
  },
  ...chainRest
} = chained;
export const stored = chained === sharedSlot;
export { viaChain, chainRest };