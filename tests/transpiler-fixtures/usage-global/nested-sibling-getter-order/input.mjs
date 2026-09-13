// The nested method read stays between its earlier and later ordinary getters.
// Capturing the receiver must preserve each sibling read once, in source order.
const events = [];
const source = {
  get before() { events.push('before'); return 1; },
  get slot() { events.push('slot'); return [4, 8]; },
  get after() { events.push('after'); return 2; },
};
export const { before, slot: { at }, after } = source;
