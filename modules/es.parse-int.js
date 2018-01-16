var $parseInt = require('./_parse-int');
// 18.2.5 parseInt(string, radix)
require('./_export')({ global: true, forced: parseInt != $parseInt }, { parseInt: $parseInt });
