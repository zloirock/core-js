// Nested sequence prefixes run once in source order before the static binding.
const se1 = () => console.log('se1');
const se2 = () => console.log('se2');
const { Array: { from: f1 } } = (se1(), (se2(), globalThis));
const { Array: { of: f2 } } = (se1(), globalThis);
console.log(f1([1]), f2(2));
