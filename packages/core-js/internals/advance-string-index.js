'use strict';
var at = require('../internals/string-at')(true);
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};
