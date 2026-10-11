// A nested instance claim on a member target loads its method whatever the target: a sole write, a
// decided selection's live arm, a slot beside a sibling and a slot under an effectful key alike.
const target = {};
const arr = [1, 2];
({ C: { at: target.at } } = { C: arr });
({ C: { flat: target.flat } } = typeof Symbol != 'undefined' ? { C: arr } : { C: other });
let sibling;
({ C: { includes: target.includes, sibling } } = { C: arr });
({ C: { [(log(), 'findLast')]: target.findLast } } = { C: arr });
export { target, sibling };
