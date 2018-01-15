var isObject = require('./_is-object');
var $ = require('./_state');

module.exports = function (it, TYPE) {
  var state;
  if (!isObject(it) || (state = $(it)).type !== TYPE) {
    throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  } return state;
};
