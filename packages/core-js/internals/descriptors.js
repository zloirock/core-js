var fails = require('../internals/fails');

// Handle IE8's unusual defineProperty implementation
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});
