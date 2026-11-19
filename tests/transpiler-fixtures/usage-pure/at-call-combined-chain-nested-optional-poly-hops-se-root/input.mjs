// side-effecting root in the nested-optional-poly-hop shape: getArr() must be memoized into a ref
// and evaluated EXACTLY once in both flavors (babel nests the inner sub-chain, unplugin flattens to
// one OR-chain). pins that root memoization stays parser-consistent across the two emission
// strategies. cosmetic shape divergence -> output-unplugin.mjs
function getArr() { return [[1]]; }
getArr().flat?.()?.flatMap(x => x)?.at(0);
