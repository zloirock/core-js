// A nested instance claim whose member target is the assignment's only write takes the dispatch in the
// statement's place: the setter runs once, with the polyfill. Beside a sibling the target stays native,
// so its write keeps its order; an effectful key keeps the slot, and the target with it.
const target = {};
const arr = [1, 2];
({ C: { at: target.at } } = { C: arr });
({ C: { flat: target.flat } } = typeof Symbol != 'undefined' ? { C: arr } : { C: other });
let sibling;
({ C: { includes: target.includes, sibling } } = { C: arr });
({ C: { [(log(), 'findLast')]: target.findLast } } = { C: arr });
export { target, sibling };
