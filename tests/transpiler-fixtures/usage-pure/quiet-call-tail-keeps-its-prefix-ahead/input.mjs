// a sequence prefix ahead of a CALL tail runs before the call even where the rescue canon calls the
// callee quiet - the callee may read what the prefix wrote (`q.x`) or observe it through a getter -
// so a host the statics empty keeps prefix and call in source order, as one init: an assignment, a
// declaration, an export, and a `var` the prefix itself reads
const o = { get g() { log(); return 1; } };
function mp() { return (q.x, Array); }
function mi() { return (o.g, Iterator); }
function mq() { return Promise; }
let a1, b1;
({ from: a1, of: b1 } = (q = { x: 1 }, mp()));
const { from: a2, concat: b2 } = (q = { x: 2 }, mi());
export const { try: a3, withResolvers: b3 } = (q = { x: 3 }, mq());
var a4, b4;
({ allSettled: a4, any: b4 } = (log(typeof a4), mq()));
use(a1, b1, a2, b2, a4, b4);
