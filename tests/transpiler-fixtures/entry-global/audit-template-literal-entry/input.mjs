// an interpolation-free template literal must be treated identically to a plain string
// when used as the `require()` argument; previously the entry was silently ignored.
require(`core-js/actual/promise`);
