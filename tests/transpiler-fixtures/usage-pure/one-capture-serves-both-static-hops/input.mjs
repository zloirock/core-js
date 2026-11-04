// The first static is bound when the second computed key runs.
// Both constructors are known at their original source slots.
const box = { O: Object, A: Array };
let keys, from;
({ [(first(), 'O')]: { keys }, [(next(keys), 'A')]: { from } } = box);
export { keys, from };
