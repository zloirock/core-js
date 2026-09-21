// Each static in an array-wrapped object pattern receives its own pure method.
const [{ from, of }] = [Array];
from([1, 2]);
of(3, 4);
