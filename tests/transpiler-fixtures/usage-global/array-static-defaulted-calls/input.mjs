// A proven returned array retains the call, native iteration and static property read.
// An empty element default stays in the native pattern for both call spellings.
const makeMath = () => [Math];
const [{ sign } = {}] = makeMath?.();
const makeArray = () => [Array, 0];
const [{ of } = {}] = makeArray();
use(sign, of);
