'use strict';
require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.of');
var $WeakSet = require('../../modules/_path').WeakSet;
var $of = $WeakSet.of;

module.exports = function of() {
  return $of.apply(typeof this === 'function' ? this : $WeakSet, arguments);
};
