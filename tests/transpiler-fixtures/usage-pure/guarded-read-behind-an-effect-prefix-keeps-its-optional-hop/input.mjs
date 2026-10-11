// a guarded static read whose receiver carries an effect prefix re-reads the name behind it and keeps the
// `?.` the read wears: where the name holds a nullish value the read short-circuits as written
let M = Map;
if (flag) M = null;
let count = 0;
export const grouped = (count++, M)?.groupBy;
