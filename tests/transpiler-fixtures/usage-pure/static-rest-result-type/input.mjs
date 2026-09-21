// A static extracted beside rest keeps its known call-result type.
const { from: make, ...rest } = Array;
use(make([1, 2]).at(-1), rest);
