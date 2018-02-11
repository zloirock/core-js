'use strict';
require('../../modules/es.set');
require('../../modules/esnext.set.of');
var $Set = require('../../internals/path').Set;
var $of = $Set.of;

module.exports = function of() {
  return $of.apply(typeof this === 'function' ? this : $Set, arguments);
};
