// Scalar static defaults keep the user's fallback on a foreign receiver.
// Every claimed slot in a guarded pattern gets its own identity check.
let M = pickConstructor();
if (!M) M = Array;
const { from, of: method = 1 } = M;
export { from, method };
