// A member receiver is read once before nested extraction.
const { [Symbol.iterator]: { next: memberNext = [7].flat() }, tail } = holder.list;
export const viaMemberControl = [memberNext, tail];
