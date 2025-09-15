'use strict';
var $ = require('../internals/export');
var iteratorWindow = require('../internals/iterator-window');

var $TypeError = TypeError;
var ALLOW_PARTIAL = 'allow partial';

// `Iterator.prototype.windows` method
// https://github.com/tc39/proposal-iterator-chunking
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  windows: function windows(windowSize /* , undersized */) {
    var undersized = arguments.length < 2 ? undefined : arguments[1];
    if (undersized !== undefined && undersized !== 'only full' && undersized !== ALLOW_PARTIAL) {
      throw new $TypeError('Incorrect `undersized` argument');
    }
    return iteratorWindow(this, windowSize, undersized === ALLOW_PARTIAL);
  }
});
