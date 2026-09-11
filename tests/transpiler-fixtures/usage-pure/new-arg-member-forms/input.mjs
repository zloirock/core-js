// polyfillable member reads around `new` in the remaining positions: a sequence receiver
// keeps its side effect and evaluation order, a paren-sealed optional callee keeps the
// null-guard inside the callee slot, an argument-less `new` of a bare method read gets
// empty construct args, a well-known-symbol read and a spread argument fold as plain args
const t1 = new Tag((log.push('e'), arr).at, 'x');
const t2 = new (arr?.includes)(1);
const t3 = new arr.findLast;
const t4 = new Tag(list[Symbol.iterator], 'y');
const t5 = new Tag(...items.flat, 'z');
const t6 = new Tag(arr[(log.push('k'), 'includes')], 'w');
const t7 = new Tag(arr?.findLastIndex, 'v');
