import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// nested SE prefixes in proxy-global flatten init: `(se1(), (se2(), globalThis))` must
// lift BOTH se1() and se2() as preceding statements. without recursive peel, only
// outermost se1() lifts and inner se2() silently elides during the rewrite
const se1 = () => console.log('se1');
const se2 = () => console.log('se2');
se1(), se2();
const f1 = _Array$from;
se1();
const f2 = _Array$of;
console.log(f1([1]), f2(2));