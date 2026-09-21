// A known static binds the pure method even when a native implementation exists.
// Its user default stays dead because the pure import is defined.
const { Array: { from = [] } } = globalThis;
from([1, 2, 3]);
