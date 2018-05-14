// fallback for non-array-like ES3 and non-enumerable old V8 strings
var classof = require('../internals/classof-raw');
var split = ''.split;
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
};
