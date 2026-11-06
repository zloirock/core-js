// A split assignment yields the receiver captured before its binding writes.
// A live default may rebind the source without changing the assignment's result.
let M = pickConstructor();
if (!M) M = Array;
let first, method;
const result = ({ from: first, of: method = (M = {}, fallback()) } = M);
export { first, method, result };
