// a decided selection folded to `eval` in a callee's place keeps it a value, `(0, eval)`: called bare it would
// turn into a direct eval of the caller's scope; folded to any other name it is called bare
const local = 1;
export const indirect = (0, eval)('typeof local');
export const direct = String(local);