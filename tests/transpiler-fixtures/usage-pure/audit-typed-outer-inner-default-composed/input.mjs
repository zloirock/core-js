// a TYPED outer slot is always defined, so its inner default never fires - the composed
// two-step extraction dispatches the LIVE outer step and folds the default through the
// canonical guard, instead of mirroring the polyfill into the dead default branch
const src = [1, [2]];
export const { at: { name } = {} } = src;
const { at: { name: sibling } = {}, other } = src;
// an ARRAY-pattern default binds the guard to its own pattern - same canon, array spelling
const { at: [firstChar] = [] } = src;
const { at: [bareChar] } = src;
export { firstChar, bareChar };
// a receiver-bearing default folds through the same guard - its receiver is the fallback
// exactly on the branch the runtime default fires on
const fallback = { name: 1 };
const { at: { name: viaFallback } = fallback } = src;
export { sibling, other, viaFallback };
