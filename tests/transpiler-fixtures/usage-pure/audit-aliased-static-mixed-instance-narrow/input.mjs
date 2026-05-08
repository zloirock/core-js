// two distinct narrowing sources in one fixture: a direct static call (`Object.keys()`
// returns string[]) and a destructure-aliased static (`{ from } = Array`). each must
// resolve independently without cross-contaminating the other's narrowing state
const o = { a: 1, b: 2, c: 3 };
const k = Object.keys(o).at(-1);
const { from } = Array;
const m = from('xyz').flatMap(ch => [ch, ch.toUpperCase()]);
export { k, m };
