// Two destructure-host shapes coexist: proxy-global `globalThis` and a const-bound `{ a: Object }`.
// Each must resolve to its own constructor (Array vs Object) without leaking through the other path.
const { Array: { from } } = globalThis;
const wrapper = { a: Object };
const { a: { entries } } = wrapper;
const arr = from('hi');
const pairs = entries({ k: 1 });
arr.includes('h');
pairs.at(0);
