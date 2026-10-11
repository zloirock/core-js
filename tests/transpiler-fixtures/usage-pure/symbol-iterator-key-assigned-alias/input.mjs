// a key binding only an assignment gives a value holds the well-known symbol wherever the write
// reaches the read - a closure defined after it and a read in the same scope alike - so both
// reads route through the iterator-method helper
let key;
key = Symbol.iterator;
export const read = receiver => receiver[key];
export const direct = [1, 2][key];
