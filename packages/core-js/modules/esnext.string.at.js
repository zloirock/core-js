'use strict';
var $ = require('../internals/export');
var codePointAt = require('../internals/string-at');

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
$({ target: 'String', proto: true }, {
  at: function at(pos) {
    return codePointAt(this, pos, true);
  }
});
