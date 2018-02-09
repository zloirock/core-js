var parseInt = require('./_parse-int');

// `Number.parseInt` method
// https://tc39.github.io/ecma262/#sec-number.parseint
require('./_export')({ target: 'Number', stat: true, forced: Number.parseInt != parseInt }, {
  parseInt: parseInt
});
