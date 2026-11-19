// Nested reads keep logical assignment and its selected value, including a prefix.
let a, b, c = source;
const { list: { at } } = (a ||= make());
const { list: { includes } } = (note(), b ??= make());
const { list: { flat } } = (c &&= make());
