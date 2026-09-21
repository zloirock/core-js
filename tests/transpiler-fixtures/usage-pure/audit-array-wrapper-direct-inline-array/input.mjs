// An inline array wrapper pairs its object pattern with Array.
// The static binding receives the pure method.
const [{ from }] = [Array];
from([1, 2]);
