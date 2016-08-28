// https://rwaldron.github.io/proposal-math-extensions/
var $export = require('./_export')
  , scale = require('./_math-scale');

$export($export.S, 'Math', {scale: scale});
