import _Array$of from "@core-js/pure/actual/array/of";
import _Math$sign from "@core-js/pure/actual/math/sign";
// A proven returned array retains the call, native iteration and static property read.
// An empty element default stays in the native pattern for both call spellings.
const makeMath = () => [Math];
const [{
  sign: _unused
} = {}] = makeMath?.();
const sign = _Math$sign;
const makeArray = () => [Array, 0];
const [{
  of: _unused2
} = {}] = makeArray();
const of = _Array$of;
use(sign, of);