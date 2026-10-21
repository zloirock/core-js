import _Map from "@core-js/pure/actual/map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
let spellingHits = 0;
const prefixed = (spellingHits++, {
  Map: _Map
});
const {
  Map: {
    groupBy: viaPrefix
  },
  ...prefixRest
} = prefixed;
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
const hopSource = {
  Map: _Map
};
const hopped = hopSource;
const {
  Map: {
    groupBy: viaHop
  },
  ...hopRest
} = hopped;
const leftArm = {
  Map: _Map
};
const rightArm = {
  Map: _Map
};
const armed = leftArm || rightArm;
const {
  Map: {
    groupBy: viaArms
  },
  ...armsRest
} = armed;
const indexedSource = [_Map];
const indexedHop = indexedSource;
const [_ref] = indexedHop,
  {
    groupBy: viaIndexHop,
    ...indexHopRest
  } = _Map;
const plainSource = {
  Map: {}
};
const plainHop = plainSource;
const {
  Map: {
    groupBy: viaPlainSlot
  },
  ...plainRest
} = plainHop;
export { viaPrefix, viaChain, viaHop, viaArms, viaIndexHop, viaPlainSlot };
export { prefixRest, chainRest, hopRest, armsRest, indexHopRest, plainRest, spellingHits, sharedSlot };