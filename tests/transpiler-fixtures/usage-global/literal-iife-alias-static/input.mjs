// A fixed alias may expose a static through the ordinary shared capture.
// Its original literal IIFE is evaluated once, without replaying the initializer.
const held = (() => ({ C: Map }))();
const { C: { groupBy } } = held;
export const r = typeof groupBy;
