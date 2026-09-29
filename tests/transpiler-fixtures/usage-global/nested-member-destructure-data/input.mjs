// Destructuring named data keys off a nested literal preserves its types for every reader.
const wrap = { box: { data: [1, 2] } };
const { data } = wrap.box;
export const { at } = wrap.box.data;
const other = { Box: { Text: 'abc' } };
export const { Text: { includes } } = other.Box;
