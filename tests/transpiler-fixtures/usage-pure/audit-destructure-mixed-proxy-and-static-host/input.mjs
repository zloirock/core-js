// Direct realm destructuring serves Array.from while a literal Object wrapper stays native.
// Both static results still narrow their later instance calls independently.
const { Array: { from } } = globalThis;
const wrapper = { a: Object };
const { a: { entries } } = wrapper;
const arr = from('hi');
const pairs = entries({ k: 1 });
arr.includes('h');
pairs.at(0);
