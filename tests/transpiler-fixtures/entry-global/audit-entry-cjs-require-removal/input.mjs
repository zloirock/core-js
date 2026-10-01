// CJS-style: `require('core-js/actual/array/at')` is recognised as an entry point.
// Plugin removes the statement and injects individual module imports (as `require`s
// since the file has CJS markers below). Confirm no mixed import/require output.
require('core-js/actual/array/at');
module.exports.foo = 42;
