'use strict';
require('../../modules/es.weak-map');
require('../../modules/esnext.weak-map.of');
var $WeakMap = require('../../internals/path').WeakMap;
var $of = $WeakMap.of;

module.exports = function of() {
  return $of.apply(typeof this === 'function' ? this : $WeakMap, arguments);
};
