// most Object methods by ES2015+ should accept primitives
var $export = require('./_export');
var path = require('./_path');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (path.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};
