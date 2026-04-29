// nested SE prefixes in proxy-global flatten init: `(se1(), (se2(), globalThis))` lifts
// BOTH se1() and se2() as preceding statements. recursive peel walks the inner sequence
// so every SE prefix retains its observable effect after the rewrite
const se1 = () => console.log('se1');
const se2 = () => console.log('se2');
const { Array: { from: f1 } } = (se1(), (se2(), globalThis));
const { Array: { of: f2 } } = (se1(), globalThis);
console.log(f1([1]), f2(2));
