// An array-wrapped object pattern with a dead default receives the pure static.
// The known element decides the live receiver before the default is considered.
const [{ from } = {}] = [Array];
from([1, 2, 3]);
