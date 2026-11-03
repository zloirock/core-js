// A literal returned by a transparent IIFE keeps native destructuring.
// The substituted constructor must carry its static.
const { C: { groupBy } } = (() => ({ C: Map }))();
export const r = typeof groupBy;
