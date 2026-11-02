'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');

module.exports = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
  var next = record.next;
  var step, result;
  while (!(step = anObject(call(next, iterator))).done) {
    result = fn(step.value);
    if (result !== undefined) return result;
  }
};
