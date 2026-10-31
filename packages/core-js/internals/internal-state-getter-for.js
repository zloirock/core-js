'use strict';
var isObject = require('../internals/is-object');
var get = require('../internals/internal-state').get;

var $TypeError = TypeError;

module.exports = function (type) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== type) {
      throw new $TypeError('Incompatible receiver, ' + type + ' required');
    } return state;
  };
};
