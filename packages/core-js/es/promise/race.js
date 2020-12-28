'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.race');
require('../../modules/es.promise.resolve');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

var Promise = path.Promise;
var $race = Promise.race;

module.exports = function race(iterable) {
  return $race.call(typeof this === 'function' ? this : Promise, iterable);
};
