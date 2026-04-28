// nested ObjectPattern with rest gather inside ArrayPattern element. synth-swap
// can't be applied (the array literal source obscures element-wise polyfill recovery)
// and the rest gather forces structural preservation. plugin emits the destructure
// verbatim - no polyfill substitution despite `Array` being statically visible
const [{ from, ...rest }] = [Array];
from([1]);
rest;
