// A literal IIFE keeps the same native static boundary as a direct wrapper.
// Array has no substituted constructor and its method stays native in pure mode.
const { C: { from } } = (() => ({ C: Array }))();
export const r = typeof from;
