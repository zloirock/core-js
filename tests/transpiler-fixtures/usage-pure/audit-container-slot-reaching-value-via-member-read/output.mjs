// the member-read spelling bails the same way
const cm = {
  s: Object
};
cm.s = Array;
export const viaMemberRead = cm.s.from([1]);