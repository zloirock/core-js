import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Two nested-proxy destructures in the same multi-decl with surrounding plain siblings;
// the second destructure carries an SE prefix. each split event must preserve sibling
// order relative to the already-split predecessors: from -> before -> SE -> keys -> after.
// exercises the cascade path firing TWICE on the same declaration (each visit operates
// on the rewritten declaration state from the previous visit).
const from = _Array$from;
const before = trackBefore();
log('SE');
const keys = _Object$keys;
const after = trackAfter();
export { from, before, keys, after };