'use strict';
var $ = require('../internals/export');
var NATIVE_RAW_JSON = require('../internals/native-raw-json');
var toString = require('../internals/to-string');
var createProperty = require('../internals/create-property');
var setInternalState = require('../internals/internal-state').set;

var $SyntaxError = SyntaxError;
var parse = JSON.parse;
var create = Object.create;
var freeze = Object.freeze;

var ERROR_MESSAGE = 'Unacceptable as raw JSON';

var isWhitespace = function (it) {
  return it === ' ' || it === '\t' || it === '\n' || it === '\r';
};

// `JSON.rawJSON` method
// https://tc39.es/proposal-json-parse-with-source/#sec-json.rawjson
// https://github.com/tc39/proposal-json-parse-with-source
$({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON }, {
  rawJSON: function rawJSON(text) {
    var jsonString = toString(text);
    if (jsonString === '' || isWhitespace(jsonString[0]) || isWhitespace(jsonString[jsonString.length - 1])) {
      throw new $SyntaxError(ERROR_MESSAGE);
    }
    var parsed = parse(jsonString);
    if (typeof parsed == 'object' && parsed !== null) throw new $SyntaxError(ERROR_MESSAGE);
    var obj = create(null);
    setInternalState(obj, { type: 'RawJSON' });
    createProperty(obj, 'rawJSON', jsonString);
    return freeze(obj);
  },
});
