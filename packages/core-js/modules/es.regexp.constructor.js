var global = require('core-js-internals/global');
var inheritIfRequired = require('./_inherit-if-required');
var defineProperty = require('./_object-define-property').f;
var getOwnPropertyNames = require('./_object-get-own-property-names').f;
var isRegExp = require('core-js-internals/is-regexp');
var getFlags = require('core-js-internals/regexp-flags');
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (require('core-js-internals/descriptors') && (!CORRECT_NEW || require('core-js-internals/fails')(function () {
  re2[require('core-js-internals/well-known-symbol')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? getFlags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || defineProperty($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = getOwnPropertyNames(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');
