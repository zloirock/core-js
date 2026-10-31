// a nested leaf whose claim spells its key with an effect: the key runs where the source wrote it, in the
// twin's residual, and the claim reads the memo after it - behind a leading binding and ahead of a
// trailing one alike
const { y: { z: { w }, [(e(), 'at')]: a } } = p;
const { y: { [(e(), 'flat')]: b, v: { x } } } = p;
use(w, a, b, x);
