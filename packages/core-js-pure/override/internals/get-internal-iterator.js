'use strict';
var classof = require('../internals/classof');
var Iterators = require('../internals/iterators');

module.exports = function (it) {
  var klass = classof(it);
  return Iterators[klass === 'Arguments' ? 'Array' : klass];
};
