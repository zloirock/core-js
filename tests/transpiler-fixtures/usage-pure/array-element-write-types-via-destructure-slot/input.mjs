// a destructure slot copies the element value at execution - the READ through the slot keeps
// precision, while the destructured SOURCE binding classifies conservatively as an escape
const [headSlot] = [[7], [8]];
export const viaDestructureSlot = headSlot.includes(7);
