// the member-read spelling reaches the same written value
const cm = { s: Object };
cm.s = Array;
export const viaMemberRead = cm.s.from([1]);
