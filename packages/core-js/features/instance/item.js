var arrayItem = require('../array/virtual/item');
var stringItem = require('../string/virtual/item');

var ArrayPrototype = Array.prototype;
var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.item;
  if (it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.item)) return arrayItem;
  if (typeof it === 'string' || it === StringPrototype || (it instanceof String && own === StringPrototype.item)) {
    return stringItem;
  } return own;
};
