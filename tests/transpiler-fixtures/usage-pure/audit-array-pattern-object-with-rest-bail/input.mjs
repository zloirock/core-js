// nested object destructure with rest gather inside an array destructure element.
// Receiver-rewrite can't be applied (the array literal source obscures element-wise
// polyfill recovery) and the rest gather forces structural preservation. The plugin
// emits the destructure verbatim - no polyfill substitution despite `Array` being
// statically visible
const [{ from, ...rest }] = [Array];
from([1]);
rest;
