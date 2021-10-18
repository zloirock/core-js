require('../../modules/es.object.to-string');
require('../../modules/es.string.iterator');
var call = require('../../internals/function-call');
var Iterators = require('../../internals/iterators');

var getStringIterator = Iterators.String;

module.exports = function (it) {
  return call(getStringIterator, it);
};
