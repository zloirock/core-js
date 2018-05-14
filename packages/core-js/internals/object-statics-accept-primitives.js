var $export = require('../internals/export');
var path = require('../internals/path');
var fails = require('../internals/fails');

// most Object methods by ES2015+ should accept primitives
module.exports = function (METHOD_NAME, getWrapper, SHAM) {
  var nativeMethod = (path.Object || {})[METHOD_NAME] || Object[METHOD_NAME];
  var exported = {};
  exported[METHOD_NAME] = getWrapper(nativeMethod);
  $export({ target: 'Object', stat: true, forced: fails(function () { nativeMethod(1); }), sham: SHAM }, exported);
};
