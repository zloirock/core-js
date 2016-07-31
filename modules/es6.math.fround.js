// 20.2.2.16 Math.fround(x)
var $export = require('./_export')
  , fround = require('./_math-fround');

$export($export.S, 'Math', {fround: fround});
