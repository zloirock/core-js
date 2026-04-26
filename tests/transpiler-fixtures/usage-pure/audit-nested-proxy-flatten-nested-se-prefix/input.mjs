// nested SE prefixes in proxy-global flatten init: `(se1(), (se2(), globalThis))` must
// lift BOTH se1() and se2() as preceding statements. without recursive peel, only
// outermost se1() lifts and inner se2() silently elides during the rewrite
const se1 = () => console.log('se1');
const se2 = () => console.log('se2');
const { Array: { from: f1 } } = (se1(), (se2(), globalThis));
const { Array: { of: f2 } } = (se1(), globalThis);
console.log(f1([1]), f2(2));
