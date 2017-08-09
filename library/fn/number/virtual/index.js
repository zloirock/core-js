require('../../../modules/es.number.to-fixed');
require('../../../modules/es.number.to-precision');
var $Number = require('../../../modules/_entry-virtual')('Number');
$Number.iterator = require('../../../modules/_iterators').Number;
module.exports = $Number;
