// fallback for non-array-like ES3 and non-enumerable old V8 strings
var classof = require('../internals/classof-raw');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return classof(it) == 'String' ? it.split('') : Object(it);
};
