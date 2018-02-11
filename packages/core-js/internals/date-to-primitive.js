'use strict';
var anObject = require('core-js-internals/an-object');
var toPrimitive = require('../internals/to-primitive');

module.exports = function (hint) {
  if (hint !== 'string' && hint !== 'number' && hint !== 'default') throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint !== 'number');
};
