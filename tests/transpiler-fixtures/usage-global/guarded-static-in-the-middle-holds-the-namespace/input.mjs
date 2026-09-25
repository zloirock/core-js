// a static read off a CONDITIONALLY reassigned name in the MIDDLE of a pattern gets no identity guard
// (the render guards a sole slot or a pattern end only): the census holds the constructor's namespace
// for it instead, in a declaration and an assignment, while a pattern end keeps its guard
let M = Map;
if (n) M = { groupBy: 7, name: 'x' };
const { a1, groupBy: s1, name: nm1 } = M;
let P = Promise;
if (n) P = {};
let a2, t2, nm2;
({ a2, try: t2, name: nm2 } = P);
let I = Iterator;
if (n) I = {};
const { name: nm3, from: f3 } = I;
use(a1, s1, nm1, a2, t2, nm2, nm3, f3);
