// A store in the initializer keeps the value it installs, so a nested instance claim reads its hop off that
// value after the store runs once, where the source runs it - over a literal, a binding, a call and behind a
// prefix, in a declaration, an export, an unbraced `var`, a loop head, an assignment and a parameter default.
// A stored global keeps its channels without the store: a constructor's surface, and a realm key's name match.
let kw, padEnd, toReversed, n = 0;
const box = { y: [1, 2], s: 'ab' };
function make() { return { y: 'cd' }; }
const { y: { at } } = kw = { y: [1, 2] };
export const { y: { includes } } = kw = box;
if (box) var { y: { trimEnd } } = kw = make();
for (const { y: { findLast } } = (n++, kw = box); ;) break;
({ s: { padEnd } } = kw = box);
export function pick(p = (({ y: { toReversed } } = kw = box), 1)) { return p; }
const { prototype: { with: replaced } } = kw = Array;
const { y: { flat } } = kw = globalThis;
export { at, trimEnd, padEnd, toReversed, replaced, flat, n };
