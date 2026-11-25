// A member read uses the result of require. Binding the result in a variable or a pattern
// also needs the original module value.
require('core-js/actual/array/from').default;
const arrayFrom = require('core-js/actual/array/from');
const {
  all
} = require('core-js/actual/promise');