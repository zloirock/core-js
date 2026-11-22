'use strict';
var getBuiltIn = require('../internals/get-built-in');
var isObject = require('../internals/is-object');
var getInternalState = require('../internals/internal-state').get;
var NATIVE_RAW_JSON = require('../internals/native-raw-json');

// only a native `JSON.isRawJSON` sees the internal slot of native raw JSON objects
module.exports = NATIVE_RAW_JSON ? getBuiltIn('JSON', 'isRawJSON') : function isRawJSON(O) {
  if (!isObject(O)) return false;
  var state = getInternalState(O);
  return !!state && state.type === 'RawJSON';
};
