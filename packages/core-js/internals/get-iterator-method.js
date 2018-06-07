var classof = require('../internals/classof');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var Iterators = require('../internals/iterators');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
