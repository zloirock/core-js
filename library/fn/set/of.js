'use strict';
require('../../modules/es6.set');
require('../../modules/esnext.set.of');
var $Set = require('../../modules/_core').Set;
var $of = $Set.of;
module.exports = function of() {
  return $of.apply(typeof this === 'function' ? this : $Set, arguments);
};
