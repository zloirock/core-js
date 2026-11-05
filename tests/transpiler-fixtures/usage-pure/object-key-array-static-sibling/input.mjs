// An array under an object key keeps its native static and trailing-element reads.
// The absent trailing element remains undefined.
const held = { k: [Math] };
export const { k: [{ sign }, tail] } = held;
