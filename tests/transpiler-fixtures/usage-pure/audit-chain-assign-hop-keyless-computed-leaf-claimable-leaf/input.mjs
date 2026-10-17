// claimable-string control: the leaf claims through its own ponyfill, no collapse race
let c;
export const claimableLeaf = (c = globalThis).self['Set'];
