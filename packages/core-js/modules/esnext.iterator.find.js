'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');

$({ target: 'Iterator', proto: true, real: true }, {
  find: function find(fn) {
    anObject(this);
    aFunction(fn);
    return iterate(this, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  },
});
