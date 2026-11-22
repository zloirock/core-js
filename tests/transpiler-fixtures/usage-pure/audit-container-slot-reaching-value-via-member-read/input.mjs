// The member reads its static from the Array installed in the slot.
const cm = { s: Object };
cm.s = Array;
export const viaMemberRead = cm.s.from([1]);
