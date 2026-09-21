// A defined array element keeps its object-pattern default dead.
// The static receives its pure method and preceding elements retain their values.
const [, { from } = {}] = [Set, Array];
from([1]);
