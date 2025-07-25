// types: proposals/iterator-chunking
'use strict';
var $ = require('../internals/export');
var iteratorWindow = require('../internals/iterator-window');

// `Iterator.prototype.windows` method
// https://github.com/tc39/proposal-iterator-chunking
// dependency: es.iterator.constructor
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  windows: function windows(windowSize) {
    return iteratorWindow(this, windowSize, false);
  },
});
