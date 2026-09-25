// a `var` initialized in a BRANCH still names the value a later reassigning WRITE takes from it: the
// write keeps its own read, so the init need only be able to have run by then - through a member, a
// container slot, a nested slot, a computed key, an array slot, an else arm and a loop body
let a1 = Set;
function g1() { if (on) { var ns = globalThis; } a1 = ns.Array; }
let a2 = Set;
function g2() { if (on) { var box = { A: Iterator }; } a2 = box.A; }
let a3 = Set;
function g3() { if (on) { var box = { w: { P: Promise } }; } a3 = box.w.P; }
let a4 = Set;
function g4() { if (on) { var K = 'Object'; } a4 = globalThis[K]; }
let a5 = Set;
function g5() { if (on) { var list = [Math]; } a5 = list[0]; }
let a6 = Set;
function g6() { if (on) { var ns = globalThis; } else { a6 = WeakMap; } a6 = ns.Error; }
let a7 = Set;
function g7() { for (const x of [1]) { var ns = globalThis; } a7 = ns.Map; }
use(g1, g2, g3, g4, g5, g6, g7);
use(a1.from, a2.concat, a3.try, a4.fromEntries, a5.sumPrecise, a6.isError, a7.groupBy);
