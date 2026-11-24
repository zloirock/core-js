let spellingHits = 0;
const prefixed = (spellingHits++, { Map });
const { Map: { groupBy: viaPrefix }, ...prefixRest } = prefixed;
export { viaPrefix, prefixRest, spellingHits };
