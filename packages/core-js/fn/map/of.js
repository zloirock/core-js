'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.of');
var $Map = require('../../internals/path').Map;
var $of = $Map.of;

module.exports = function of() {
  return $of.apply(typeof this === 'function' ? this : $Map, arguments);
};
