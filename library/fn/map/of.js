'use strict';
require('../../modules/es.map');
require('../../modules/esnext.map.of');
var $Map = require('../../modules/_core').Map;
var $of = $Map.of;
module.exports = function of() {
  return $of.apply(typeof this === 'function' ? this : $Map, arguments);
};
