// Each element of a multi-element array pattern receives its own pure static.
// The shared declaration retains both bindings in source order.
const [{ from }, { of }] = [Array, Array];
from([1]);
of(2, 3);
