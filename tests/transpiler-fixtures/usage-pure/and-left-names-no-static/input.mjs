// an `&&` yields its left only where that is falsy, which no constructor and no object literal ever is: a
// static read off a selection over it - a member or a pattern - takes no identity guard on the left's
// constructor, and the other arm takes its whole entry, whose statics the native read finds
export const { C: { groupBy } } = ({ C: Object } && u) || { C: Map };
export const from = ((Array && u) || Iterator).from;
