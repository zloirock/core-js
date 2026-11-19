// A literal IIFE used as a loop element keeps native destructuring.
// The substituted constructor must carry its static.
let answer;
for (const { C: { groupBy } } of [(() => ({ C: Map }))()]) answer = typeof groupBy;
export const r = answer;
