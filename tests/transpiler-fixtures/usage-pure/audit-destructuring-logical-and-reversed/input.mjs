// destructure with `&&` logical-and init in reversed operand order: the polyfill
// rewrite must still resolve the receiver consistently.
const { from } = Promise && Array;
