// object-pattern destructure containing a nested array-rest pattern: the rest binding
// still resolves to an array for instance polyfill dispatch.
const { a: [, ...rest] } = { a: [1, "hello", "world"] };
rest.at(-1);
