require('../../../modules/es.number.to-fixed');
require('../../../modules/es.number.to-precision');
var $Number = require('../../../internals/entry-virtual')('Number');
$Number.iterator = require('../../../internals/iterators').Number;

module.exports = $Number;
