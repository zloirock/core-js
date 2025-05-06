'use strict';
var isRegExp = require('../internals/is-regexp');
var regExpGetFlags = require('../internals/regexp-get-flags');

module.exports = function (it) {
  return (isRegExp(it) && !('flags' in it)) ? regExpGetFlags(it) : it.flags;
};
