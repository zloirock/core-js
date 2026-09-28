// A pattern whose init reads its own binding holds nothing yet: the read is in its TDZ or sees the
// hoisted `undefined`. The extraction keeps that read, so the source's throw survives, and judging the
// extracted name as a possible Symbol.X alias stops at the binding instead of walking back into it.
// Declaration kinds, an assignment, a defaulted slot, a selecting init and a mutual pair.
const { at } = at;
let { includes } = includes;
var { flat } = flat;
let fill;
({ fill } = fill);
const { find = null } = find;
const { findLast } = flag ? findLast : [];
const { map: first } = second, { filter: second } = first;
