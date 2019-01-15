var $export = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var fails = require('../internals/fails');

// most Object methods by ES2015+ should accept primitives
module.exports = function (METHOD_NAME, getWrapper, SHAM) {
  var nativeMethod = getBuiltIn('Object', METHOD_NAME);
  var exported = {};
  exported[METHOD_NAME] = getWrapper(nativeMethod);
  $export({ target: 'Object', stat: true, forced: fails(function () { nativeMethod(1); }), sham: SHAM }, exported);
};
