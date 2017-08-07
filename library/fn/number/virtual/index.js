require('../../../modules/es6.number.to-fixed');
require('../../../modules/es6.number.to-precision');
var $Number = require('../../../modules/_entry-virtual')('Number');
$Number.iterator = require('../../../modules/_iterators').Number;
module.exports = $Number;
