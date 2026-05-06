import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Single-element ArrayPattern wrapping the outer ObjectPattern:
// `[{ Array: { from } }] = [globalThis]` - destructure targets index 0 of an
// ArrayExpression literal. ArrayPattern is treated as transparent when it has exactly
// one element matching the chain pattern AND the host's init is an ArrayExpression
// (init element at the matched index becomes the actual receiver). The flatten walker
// drops the whole declarator anyway, so the wrapper layer + non-side-effecting array
// literal are dropped together. classifier `peelDestructureWrappers` peels and tracks
// arrayIndex for receiver derivation; babel-plugin's `peelTransparentWrappers` peels
// in the chain walker; unplugin's `planDeclarator` peels declarator.id when it's an
// ArrayPattern with single ObjectPattern element + matching ArrayExpression init
const from = _Array$from;
const of = _Array$of;
export { from, of };