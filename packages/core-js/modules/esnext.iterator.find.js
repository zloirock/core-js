'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var aCallable = require('../internals/a-callable');
var getIteratorDirect = require('../internals/get-iterator-direct');

// `Iterator.prototype.find` method
// https://github.com/tc39/proposal-iterator-helpers
$({ target: 'Iterator', proto: true, real: true }, {
  find: function find(predicate) {
    var record = getIteratorDirect(this);
    var counter = 0;
    aCallable(predicate);
    return iterate(record, function (value, stop) {
      if (predicate(value, counter++)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});
