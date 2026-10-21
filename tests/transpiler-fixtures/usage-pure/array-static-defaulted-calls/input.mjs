// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
const makeMath = () => [Math];
const [{ sign } = {}] = makeMath?.();
const makeArray = () => [Array, 0];
const [{ of } = {}] = makeArray();
use(sign, of);
