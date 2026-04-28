// SE-wrapped fallback receiver: `(0, cond ? Array : Iterator)`. fallback enumeration
// must peel safe-SE tail before reaching the conditional, otherwise the outer SE
// suppresses branch detection and only the consequent's polyfill loads. fix: SE peel
// added to `peelFallbackReceiver` (gates on side-effect-free preceding slots so observable
// effects in the prefix bail rather than silently elide)
const { from } = (0, cond ? Array : Iterator);
from([1, 2]);
