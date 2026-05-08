// Const-bound `wrapper = { ns: Object }` plus `AssignmentPattern` default exercises static-object descent.
// Default never fires for known constructors, so flatten must peel it and emit a polyfill alias.
const wrapper = { ns: Object };
const { ns: { entries } = {} } = wrapper;
const arr = entries({ k: 1 });
arr.includes(['k', 1]);
