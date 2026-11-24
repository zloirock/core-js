import _Map from "@core-js/pure/actual/map";
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
export { viaPrefix, prefixRest, spellingHits };