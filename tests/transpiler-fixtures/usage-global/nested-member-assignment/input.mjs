// A sole nested assignment claim owns one read of its member root, just like a declaration.
const wrap = { box: { data: [1, 2] } };
let at;
({ data: { at } } = wrap.box);
const other = { Box: { Inner: { Text: 'abc' } } };
let includes;
({ Inner: { Text: { includes } } } = other.Box);
