'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var isForced = require('../internals/is-forced');
var inheritIfRequired = require('../internals/inherit-if-required');
var create = require('../internals/object-create');
var getOwnPropertyNames = require('../internals/object-get-own-property-names').f;
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var isPrototypeOf = require('../internals/object-is-prototype-of');
var isObject = require('../internals/is-object');
var classof = require('../internals/classof-raw');
var hasRegExpMatcher = require('../internals/regexp-has-matcher');
var isRegExp = require('../internals/is-regexp');
var toPrimitive = require('../internals/to-primitive');
var toString = require('../internals/to-string');
var getRegExpFlags = require('../internals/regexp-get-flags');
var getRegExpSource = require('../internals/regexp-get-source');
var getNativeSource = require('../internals/regexp-native-source');
var escapeRegExpPattern = require('../internals/regexp-escape-pattern');
var stickyHelpers = require('../internals/regexp-sticky-helpers');
var proxyAccessor = require('../internals/proxy-accessor');
var defineBuiltIn = require('../internals/define-built-in');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var fails = require('../internals/fails');
var hasOwn = require('../internals/has-own-property');
var InternalStateModule = require('../internals/internal-state');
var setSpecies = require('../internals/set-species');
var wellKnownSymbol = require('../internals/well-known-symbol');
var UNSUPPORTED_DOT_ALL = require('../internals/regexp-unsupported-dot-all');
var UNSUPPORTED_NCG = require('../internals/regexp-unsupported-ncg');
var UNSUPPORTED_SOURCE = require('../internals/regexp-unsupported-source');

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var hasInternalState = InternalStateModule.has;
var MATCH = wellKnownSymbol('match');
var NativeRegExp = globalThis.RegExp;
var RegExpPrototype = NativeRegExp.prototype;
var SyntaxError = globalThis.SyntaxError;
var TypeError = globalThis.TypeError;
var exec = uncurryThis(RegExpPrototype.exec);
var charAt = uncurryThis(''.charAt);
var replace = uncurryThis(''.replace);
var stringIndexOf = uncurryThis(''.indexOf);
var stringSlice = uncurryThis(''.slice);
// TODO: Use only proper RegExpIdentifierName
var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var MISSED_STICKY = stickyHelpers.MISSED_STICKY;
var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
var sourceDescriptor = DESCRIPTORS && getOwnPropertyDescriptor(RegExpPrototype, 'source');
var nativeSource = sourceDescriptor && sourceDescriptor.get;
var FIX_SOURCE = UNSUPPORTED_NCG || UNSUPPORTED_SOURCE;
var PATCH_SOURCE = FIX_SOURCE && nativeSource && sourceDescriptor.configurable;
// Without a prototype getter, regexp-native-source already checks whether Rhino accepts an own getter.
var USE_OWN_SOURCE = FIX_SOURCE && !PATCH_SOURCE && getNativeSource && (!nativeSource || !fails(function () {
  var re = new NativeRegExp();
  defineBuiltInAccessor(re, 'source', { configurable: true, get: function () { return 'a'; } });
  return re.source !== 'a';
}));

var BASE_FORCED = DESCRIPTORS && (!CORRECT_NEW || MISSED_STICKY || UNSUPPORTED_DOT_ALL || FIX_SOURCE || fails(function () {
  re2[MATCH] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  // eslint-disable-next-line sonarjs/inconsistent-function-call -- required for testing
  return NativeRegExp(re1) !== re1 || NativeRegExp(re2) === re2 || String(NativeRegExp(re1, 'i')) !== '/a/i';
}));

var handleNCG = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var named = [];
  var names = create(null);
  var brackets = false;
  var ncg = false;
  var groupid = 0;
  var groupname = '';
  var chr;
  for (; index < length; index++) {
    chr = charAt(string, index);
    if (chr === '\\') {
      chr += charAt(string, ++index);
      // use `\x5c` for escaped backslash to avoid corruption by `\k<name>` to `\N` replacement below
      if (!ncg && charAt(chr, 1) === '\\') {
        result += '\\x5c';
        continue;
      }
    } else if (chr === ']') {
      brackets = false;
    } else if (!brackets) switch (true) {
      case chr === '[':
        brackets = true;
        break;
      case chr === '(':
        result += chr;
        if (exec(IS_NCG, stringSlice(string, index + 1))) {
          index += 2;
          ncg = true;
          groupid++;
        } else if (charAt(string, index + 1) !== '?') {
          groupid++;
        }
        continue;
      case chr === '>' && ncg:
        if (groupname === '' || hasOwn(names, groupname)) {
          throw new SyntaxError('Invalid capture group name');
        }
        names[groupname] = true;
        named[named.length] = [groupname, groupid];
        ncg = false;
        groupname = '';
        continue;
    }
    if (ncg) groupname += chr;
    else result += chr;
  }
  // convert `\k<name>` backreferences to numbered backreferences
  for (var ni = 0; ni < named.length; ni++) {
    var backref = '\\k<' + named[ni][0] + '>';
    var numRef = '\\' + named[ni][1];
    while (stringIndexOf(result, backref) > -1) {
      result = replace(result, backref, numRef);
    }
  } return [named.length ? result : string, named];
};

// https://tc39.es/ecma262/#sec-get-regexp.prototype.source
var sourceAccessor = { configurable: true, get: function source() {
  return escapeRegExpPattern(getInternalState(this).rawSource || getNativeSource(this));
} };

var setSource = function (re, state, pattern) {
  state.rawSource = pattern;
  if (!USE_OWN_SOURCE) return;
  var own = getOwnPropertyDescriptor(re, 'source');
  if (!pattern) {
    // Rhino keeps the own getter after compile, even when it is configurable.
    if (nativeSource && own && own.configurable && own.get === sourceAccessor.get) delete re.source;
  } else if (!own || !nativeSource && !own.configurable && own.writable === false) try {
    defineBuiltInAccessor(re, 'source', sourceAccessor);
  } catch (error) { /* non-extensible RegExp */ }
};

var toRegExpString = function (value) {
  return value === undefined ? '' : toString(toPrimitive(value, 'string'));
};

var removeFlag = function (flags, flag) {
  var rest = replace(flags, flag, '');
  if (stringIndexOf(rest, flag) !== -1) throw new SyntaxError('Duplicate RegExp flag');
  return rest;
};

// `RegExp` constructor
// https://tc39.es/ecma262/#sec-regexp-constructor
if (isForced('RegExp', BASE_FORCED)) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = isPrototypeOf(RegExpPrototype, this);
    var patternIsRegExp = isRegExp(pattern);
    var flagsAreUndefined = flags === undefined;
    var groups = [];
    var rawPattern = pattern;
    var rawFlags, dotAll, sticky, handled, result, state, keepSource;

    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
      return pattern;
    }

    if (patternIsRegExp || isPrototypeOf(RegExpPrototype, pattern)) {
      pattern = getRegExpSource(pattern);
      if (flagsAreUndefined) flags = getRegExpFlags(rawPattern);
    }

    pattern = toRegExpString(pattern);
    flags = toRegExpString(flags);
    rawPattern = pattern;

    if (UNSUPPORTED_DOT_ALL && 'dotAll' in re1) {
      dotAll = !!flags && stringIndexOf(flags, 's') > -1;
      if (dotAll) flags = removeFlag(flags, 's');
    }

    rawFlags = flags;

    if (MISSED_STICKY && 'sticky' in re1) {
      sticky = !!flags && stringIndexOf(flags, 'y') > -1;
      if (sticky && UNSUPPORTED_Y) flags = removeFlag(flags, 'y');
    }

    if (UNSUPPORTED_NCG && stringIndexOf(pattern, '(?<') !== -1) {
      handled = handleNCG(pattern);
      pattern = handled[0];
      groups = handled[1];
    }

    result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype, RegExpWrapper);

    keepSource = groups.length || UNSUPPORTED_SOURCE && exec(/[\n\r/\u2028\u2029]/, rawPattern)
      && escapeRegExpPattern(rawPattern) !== getRegExpSource(result);
    if (dotAll || sticky || keepSource) {
      state = enforceInternalState(result);
      if (dotAll) {
        state.dotAll = true;
        state.raw = new RegExpWrapper(escapeRegExpPattern(pattern, true), rawFlags);
      }
      if (sticky) state.sticky = true;
      if (groups.length) state.groups = groups;
      if (keepSource) setSource(result, state, rawPattern);
    }

    return result;
  };

  for (var keys = getOwnPropertyNames(NativeRegExp), index = 0; keys.length > index;) {
    proxyAccessor(RegExpWrapper, NativeRegExp, keys[index++]);
  }

  RegExpPrototype.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype;
  defineBuiltIn(globalThis, 'RegExp', RegExpWrapper, { constructor: true });

  var nativeCompile = (FIX_SOURCE || UNSUPPORTED_DOT_ALL || MISSED_STICKY) && RegExpPrototype.compile;
  // An earlier core-js may have replaced exec without saving the native method.
  var hasMatcher = hasRegExpMatcher || function (it) {
    return isObject(it) && it !== RegExpPrototype && hasOwn(it, 'lastIndex') && classof(it) === 'RegExp';
  };

  // https://tc39.es/ecma262/#sec-regexp.prototype.compile
  if (nativeCompile) defineBuiltIn(RegExpPrototype, 'compile', function compile(pattern, flags) {
    if (!hasMatcher(this)) throw new TypeError('RegExp expected');
    var compiled;
    if (hasMatcher(pattern)) {
      if (flags !== undefined) throw new TypeError('RegExp flags cannot be specified');
      compiled = new NativeRegExp();
      call(nativeCompile, compiled, pattern);
      // Rhino 1.7.x copies lastIndex from a RegExp argument.
      compiled.lastIndex = 0;
    } else {
      pattern = compiled = new RegExpWrapper(toRegExpString(pattern), flags);
    }
    // Coercion can recompile this RegExp. Resetting lastIndex can still throw after its matcher changes.
    if (hasInternalState(pattern) || hasInternalState(this)) {
      var from = getInternalState(pattern);
      var state = enforceInternalState(this);
      setSource(this, state, from.rawSource);
      state.groups = from.groups;
      state.dotAll = from.dotAll;
      state.sticky = from.sticky;
      state.raw = from.raw && new RegExpWrapper(from.raw);
    }
    call(nativeCompile, this, compiled);
    return this;
  });
}

if (PATCH_SOURCE) defineBuiltInAccessor(RegExpPrototype, 'source', sourceAccessor);

// https://tc39.es/ecma262/#sec-get-regexp-%symbol.species%
setSpecies('RegExp');
