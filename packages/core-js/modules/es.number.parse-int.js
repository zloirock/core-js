var $parseInt = require('./_parse-int');
// 20.1.2.13 Number.parseInt(string, radix)
require('./_export')({ target: 'Number', stat: true, forced: Number.parseInt != $parseInt }, {
  parseInt: $parseInt
});
