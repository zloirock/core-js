// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
var cond = true;
export const viaMemberRoot = (function G({ of, ...rest } = Array) {
  return cond ? (cond = false, <G.Sub x={1} />) : [of, rest];
})();
