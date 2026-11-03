// A literal returned by a transparent IIFE keeps the assignment pattern.
// The substituted constructor must carry its static.
let groupBy;
({ C: { groupBy } } = (() => ({ C: Map }))());
export const r = typeof groupBy;
