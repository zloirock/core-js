// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('core-js-internals/classof-raw');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};
