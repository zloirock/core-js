// A constructor alias destructured for a sibling and a prototype level: the level leaves the host behind the
// sibling it follows, and its pair - the memo of the prototype and the method's claim - stands after the
// statement, what the level kept reading off that memo.
const R = Array;
const { x, prototype: { at, length } } = R;
export const r = [x, at, length];
