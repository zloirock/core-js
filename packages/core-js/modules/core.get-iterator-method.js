var classof = require('core-js-internals/classof');
var ITERATOR = require('core-js-internals/well-known-symbol')('iterator');
var Iterators = require('../internals/iterators');

module.exports = require('../internals/core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
