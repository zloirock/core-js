// A pattern whose init reads its own binding holds nothing yet: the read is in its TDZ or sees the
// hoisted `undefined`. Each destructured method is still a claim of its own, injected for every
// receiver family it could name, and the source stays as written with its throw. Declaration kinds,
// an assignment, a defaulted slot, a selecting init and a mutual pair.
const { at } = at;
let { includes } = includes;
var { flat } = flat;
let fill;
({ fill } = fill);
const { find = null } = find;
const { findLast } = flag ? findLast : [];
const { map: first } = second, { filter: second } = first;
