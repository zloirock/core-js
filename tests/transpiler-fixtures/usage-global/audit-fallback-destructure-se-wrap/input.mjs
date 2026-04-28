// SE-wrapped fallback receiver: `(0, cond ? Array : Iterator)`. Branch enumeration
// peels safe-SE tails before reaching the conditional so each branch contributes its
// polyfill. The peel gates on side-effect-free preceding slots: observable effects in
// the prefix bail rather than silently elide
const { from } = (0, cond ? Array : Iterator);
from([1, 2]);
