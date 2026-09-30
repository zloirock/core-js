'use strict';
var $ = require('../internals/export');
var iteratorWindow = require('../internals/iterator-window');
var IS_PURE = require('../internals/is-pure');

// `Iterator.prototype.windows` method
// https://tc39.es/ecma262/#sec-iterator.prototype.windows
$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
  windows: function windows(windowSize /* , undersized */) {
    return iteratorWindow(this, windowSize, arguments.length < 2 ? undefined : arguments[1]);
  }
});
