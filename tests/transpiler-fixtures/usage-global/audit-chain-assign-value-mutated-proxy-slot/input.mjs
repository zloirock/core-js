// a mutated proxy SLOT turns the kept-value collapse off: the file stores its own value into
// `globalThis.self`, so a chain-assign value navigating that hop no longer holds the global -
// collapsing it to the leaf ponyfill would swap the user's object for the polyfilled one. the
// root still substitutes (it is not what was patched), the hops stay as written, and no claim
// fires off the unknowable value
globalThis.self = { Map: { name: 'patched' } };
let q;
export const patchedLeaf = (q = globalThis.self).Map.name;
export const patchedTail = (q = globalThis.self.window).Map.name;

// the dig through wrappers must not outrun the gate: a sequence around the assignment and a
// live guard over it read the same patched slot, so neither collapses either
const arr = [1];
export const patchedSeqAround = ((arr.at(0), q = globalThis.self)).Map.name;
export const patchedGuarded = (q = globalThis.self)?.Map.name;

// the stored-value render (an unread target, the claim declined by the target matrix) also
// declines on the patched slot: what the assignment stores is the user's object
export const patchedStoredLeaf = (q = globalThis.self)?.Object.getPrototypeOf({});
export const patchedStoredBelow = (q = globalThis.self.window)?.Object.getPrototypeOf({});
