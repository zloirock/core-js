'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var PROPER_FUNCTION_NAME = require('../internals/function-name').PROPER;
var defineBuiltIn = require('../internals/define-built-in');
var anObject = require('../internals/an-object');
var $toString = require('../internals/to-string');
var fails = require('../internals/fails');
var getRegExpFlags = require('../internals/regexp-get-flags');
var hasRegExpMatcher = require('../internals/regexp-has-matcher');
var escapeRegExpPattern = require('../internals/regexp-escape-pattern');
var getInternalState = require('../internals/internal-state').get;
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var UNSUPPORTED_NCG = require('../internals/regexp-unsupported-ncg');
var UNSUPPORTED_SOURCE = require('../internals/regexp-unsupported-source');

var TO_STRING = 'toString';
var RegExpPrototype = RegExp.prototype;
var nativeToString = RegExpPrototype[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME && nativeToString.name !== TO_STRING;
// IE8- cannot report the attributes of a RegExp's own source.
var LEGACY_READ_ONLY_SOURCE = !DESCRIPTORS && fails(function () {
  var re = /a/;
  re.source = 'b';
  return re.source !== 'b';
});
var hasReadOnlySource = function (re) {
  if (!DESCRIPTORS) return LEGACY_READ_ONLY_SOURCE;
  var own = getOwnPropertyDescriptor(re, 'source');
  return own && !own.configurable && own.writable === false;
};
var READ_ONLY_SOURCE = (UNSUPPORTED_NCG || UNSUPPORTED_SOURCE) && hasReadOnlySource(new RegExp());

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME || READ_ONLY_SOURCE) {
  defineBuiltIn(RegExpPrototype, TO_STRING, function toString() {
    var R = anObject(this);
    var raw = READ_ONLY_SOURCE && getInternalState(R).rawSource;
    var pattern = raw && hasReadOnlySource(R) ? escapeRegExpPattern(raw) : $toString(R.source);
    if (READ_ONLY_SOURCE && !raw && hasRegExpMatcher) {
      var escaped = escapeRegExpPattern(pattern);
      if (escaped !== pattern && hasRegExpMatcher(R) && hasReadOnlySource(R)) pattern = escaped;
    }
    var flags = $toString(getRegExpFlags(R));
    return '/' + pattern + '/' + flags;
  }, { unsafe: true });
}
