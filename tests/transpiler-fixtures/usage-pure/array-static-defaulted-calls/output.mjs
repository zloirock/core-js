// A returned array keeps its call, native iteration and static property read.
// Its empty element default remains in the pattern for both optional and ordinary calls.
const makeMath = () => [Math];
const [{
  sign
} = {}] = makeMath?.();
const makeArray = () => [Array, 0];
const [{
  of
} = {}] = makeArray();
use(sign, of);