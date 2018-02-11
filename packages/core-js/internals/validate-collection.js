var isObject = require('../internals/is-object');
var $ = require('../internals/state');

module.exports = function (it, TYPE) {
  var state;
  if (!isObject(it) || (state = $(it)).type !== TYPE) {
    throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  } return state;
};
