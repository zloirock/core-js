'use strict';
var $ = require('../internals/export');
var FREEZING = require('../internals/freezing');
var NATIVE_RAW_JSON = require('../internals/native-raw-json');
var getBuiltIn = require('../internals/get-built-in');
var apply = require('../internals/function-apply');
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var isRawJSON = require('../internals/is-raw-json');
var toString = require('../internals/to-string');
var createProperty = require('../internals/create-property');
var parseJSONString = require('../internals/parse-json-string');
var getReplacerFunction = require('../internals/get-json-replacer-function');
var uid = require('../internals/uid');
var setInternalState = require('../internals/internal-state').set;

var $SyntaxError = SyntaxError;
var parse = getBuiltIn('JSON', 'parse');
var $stringify = getBuiltIn('JSON', 'stringify');
var create = getBuiltIn('Object', 'create');
var freeze = getBuiltIn('Object', 'freeze');
var at = uncurryThis(''.charAt);
var slice = uncurryThis(''.slice);
var exec = uncurryThis(/./.exec);

var MARK = uid();
var MARK_LENGTH = MARK.length;
var ERROR_MESSAGE = 'Unacceptable as raw JSON';
var IS_WHITESPACE = /^[\t\n\r ]$/;

// `JSON.parse` method
// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
// https://github.com/tc39/proposal-json-parse-with-source
$({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON }, {
  rawJSON: function rawJSON(text) {
    var jsonString = toString(text);
    if (jsonString == '' || exec(IS_WHITESPACE, at(jsonString, 0)) || exec(IS_WHITESPACE, at(jsonString, jsonString.length - 1))) {
      throw $SyntaxError(ERROR_MESSAGE);
    }
    var parsed = parse(jsonString);
    if (typeof parsed == 'object' && parsed !== null) throw $SyntaxError(ERROR_MESSAGE);
    var obj = create(null);
    setInternalState(obj, { type: 'RawJSON' });
    createProperty(obj, 'rawJSON', jsonString);
    return FREEZING ? freeze(obj) : obj;
  }
});

// `JSON.stringify` method
// https://tc39.es/ecma262/#sec-json.stringify
// https://github.com/tc39/proposal-json-parse-with-source
if ($stringify) $({ target: 'JSON', stat: true, arity: 3, forced: !NATIVE_RAW_JSON }, {
  stringify: function stringify(text, replacer, space) {
    var replacerFunction = getReplacerFunction(replacer);

    var raw = $stringify(text, function (key, value) {
      if (isCallable(replacerFunction)) value = apply(replacerFunction, this, arguments);
      return isRawJSON(value) ? MARK + ':' + value.rawJSON : value;
    }, space);

    if (typeof raw != 'string') return raw;

    var result = '';
    var length = raw.length;

    for (var i = 0; i < length; i++) {
      var chr = at(raw, i);
      if (chr === '"') {
        var end = parseJSONString(raw, ++i).end - 1;
        var string = slice(raw, i, end);
        if (slice(string, 0, MARK_LENGTH) === MARK) {
          result += slice(string, MARK_LENGTH + 1);
        } else {
          result += '"' + string + '"';
        }
        i = end;
      } else result += chr;
    }
    return result;
  }
});
