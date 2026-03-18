'use strict';
/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var toString = require('../internals/to-string');
var regexpFlags = require('../internals/regexp-flags');
var stickyHelpers = require('../internals/regexp-sticky-helpers');
var shared = require('../internals/shared');
var create = require('../internals/object-create');
var getInternalState = require('../internals/internal-state').get;
var UNSUPPORTED_DOT_ALL = require('../internals/regexp-unsupported-dot-all');
var UNSUPPORTED_NCG = require('../internals/regexp-unsupported-ncg');
var UNSUPPORTED_HAS_INDICES = require('../internals/regexp-unsupported-has-indices');

var nativeReplace = shared('native-string-replace', String.prototype.replace);
var NativeRegExp = RegExp;
var nativeExec = NativeRegExp.prototype.exec;
var $String = String;
var patchedExec = nativeExec;
var charAt = uncurryThis(''.charAt);
var indexOf = uncurryThis(''.indexOf);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);
var max = Math.max;
var arrayFill = uncurryThis(require('../internals/array-fill'));

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call(nativeExec, re1, 'a');
  call(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG || UNSUPPORTED_HAS_INDICES;

var setGroups = function (re, groups) {
  var object = re.groups = create(null);
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    object[group[0]] = re[group[1]];
  }
};

// Check if `(` at position i in source is a non-capturing open paren
var isNonCapturingParen = function (source, i) {
  var n1 = charAt(source, i + 1);
  var n2 = charAt(source, i + 2);
  var n3 = charAt(source, i + 3);
  return n1 === '?' && (
    n2 === ':' || n2 === '=' || n2 === '!' ||
    (n2 === '<' && (n3 === '=' || n3 === '!'))
  );
};

// Parse source to build parent group index array (1-based).
// result[k] = direct parent capturing group index of group k, 0 = top-level.
var getGroupParents = function (source) {
  var parents = [0];
  var stack = [0];
  var groupIndex = 0;
  var inClass = false;
  for (var i = 0; i < source.length; i++) {
    var ch = charAt(source, i);
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '[') {
      inClass = true;
      continue;
    }
    if (ch === ']') {
      inClass = false;
      continue;
    }
    if (inClass) continue;
    if (ch === '(') {
      if (isNonCapturingParen(source, i)) {
        stack.push(-1);
      } else {
        groupIndex++;
        var top = stack[stack.length - 1];
        parents.push(max(top, 0));
        stack.push(groupIndex);
      }
    } else if (ch === ')') {
      stack.pop();
    }
  }
  return parents;
};

// Parse backreference number starting at position i in source
// Returns { refNum: number, newIndex: number }
var parseBackreference = function (source, i) {
  var next = charAt(source, i);
  var refNum = next - '0';
  // Handle multi-digit backreferences like \10, \12
  while (i + 1 < source.length) {
    var digit = charAt(source, i + 1);
    if (digit >= '0' && digit <= '9') {
      i++;
      refNum = refNum * 10 + (digit - '0');
    } else break;
  }
  return { refNum: refNum, newIndex: i };
};

// Inject empty capture `()` before each capturing open paren
// Also renumber backreferences: \N -> \2N (since each original group N becomes group 2N)
var buildInstrumentedSource = function (source) {
  var result = '';
  var inClass = false;
  for (var i = 0; i < source.length; i++) {
    var ch = charAt(source, i);
    if (ch === '\\') {
      result += ch;
      i++;
      if (i >= source.length) continue;
      var next = charAt(source, i);
      // Renumber backreferences: \1 -> \2, \2 -> \4, \N -> \2N
      if (next >= '1' && next <= '9') {
        var parsed = parseBackreference(source, i);
        i = parsed.newIndex;
        // Renumber: each original group N becomes 2N
        result += $String(parsed.refNum * 2);
      } else {
        result += next;
      }
      continue;
    }
    if (ch === '[') {
      inClass = true;
      result += ch;
      continue;
    }
    if (ch === ']') {
      inClass = false;
      result += ch;
      continue;
    }
    if (inClass) {
      result += ch;
      continue;
    }
    if (ch === '(' && !isNonCapturingParen(source, i)) {
      result += '()';
    }
    result += ch;
  }
  return result;
};

// Find captured string within matchStr starting at searchFrom
var findCapturedPosition = function (matchStr, captured, searchFrom) {
  var capturedLen = captured.length;
  while (searchFrom <= matchStr.length - capturedLen) {
    if (stringSlice(matchStr, searchFrom, searchFrom + capturedLen) === captured) {
      return searchFrom;
    }
    searchFrom++;
  }
  return -1;
};

// Run instrumented regex and compute group positions with parent-aware scanning
var computeIndicesInstrumented = function (originalRe, match, str, matchStart, matchStr, indices) {
  var n = match.length;
  var instrFlags = call(regexpFlags, originalRe);
  instrFlags = replace(instrFlags, 'g', '');
  instrFlags = replace(instrFlags, 'y', '');
  instrFlags = replace(instrFlags, 'd', '');
  var instrSource = buildInstrumentedSource(originalRe.source);
  // Use native RegExp constructor to avoid polyfill side effects
  var instrRe = new NativeRegExp(instrSource, instrFlags);
  var instrMatch = call(nativeExec, instrRe, stringSlice(str, matchStart));

  if (!instrMatch || instrMatch.index !== 0) return false;

  var parents = getGroupParents(originalRe.source);
  var scanPos = arrayFill(Array(n), 0);
  var i;

  for (i = 1; i < n; i++) {
    var captured = instrMatch[2 * i] !== undefined ? instrMatch[2 * i] : match[i];
    if (captured === undefined) {
      indices[i] = undefined;
      continue;
    }
    var capturedLen = captured.length;
    var parentIdx = parents[i] !== undefined ? parents[i] : 0;
    var startFrom = scanPos[parentIdx];

    if (capturedLen === 0) {
      indices[i] = [matchStart + startFrom, matchStart + startFrom];
      scanPos[i] = startFrom;
      continue;
    }

    var found = findCapturedPosition(matchStr, captured, startFrom);
    if (found !== -1) {
      indices[i] = [matchStart + found, matchStart + found + capturedLen];
      scanPos[i] = found;
      scanPos[parentIdx] = found + capturedLen;
    } else {
      var absFound = indexOf(str, captured, 0);
      indices[i] = absFound !== -1 ? [absFound, absFound + capturedLen] : undefined;
      scanPos[i] = startFrom;
    }
  }
  return true;
};

// Fallback: simple consume-from-left without nesting info
var computeIndicesFallback = function (match, str, matchStart, matchStr, indices) {
  var fbPos = 0;
  for (var i = 1; i < match.length; i++) {
    var captured = match[i];
    if (captured === undefined) {
      indices[i] = undefined;
      continue;
    }
    var capturedLen = captured.length;
    if (capturedLen === 0) {
      indices[i] = [matchStart + fbPos, matchStart + fbPos];
      continue;
    }
    var found = findCapturedPosition(matchStr, captured, fbPos);
    if (found !== -1) {
      indices[i] = [matchStart + found, matchStart + found + capturedLen];
      fbPos = found + capturedLen;
    } else {
      var absIdx = indexOf(str, captured, 0);
      indices[i] = absIdx !== -1 ? [absIdx, absIdx + capturedLen] : undefined;
    }
  }
};

// https://tc39.es/ecma262/#sec-makematchindicesindexpairarray
var makeIndicesArray = function (originalRe, match, str, namedGroups) {
  var matchStart = match.index;
  var matchStr = match[0];
  var matchEnd = matchStart + matchStr.length;
  var n = match.length;
  var indices = [];
  var hasNamedGroups = namedGroups && namedGroups.length;
  var i, success;
  indices.length = n;
  indices[0] = [matchStart, matchEnd];
  indices.groups = hasNamedGroups ? create(null) : undefined;

  if (n > 1) {
    success = false;
    try {
      success = computeIndicesInstrumented(originalRe, match, str, matchStart, matchStr, indices);
    } catch (_) { /* fallback below */ }
    if (!success) computeIndicesFallback(match, str, matchStart, matchStr, indices);
  }

  if (hasNamedGroups) {
    for (i = 0; i < namedGroups.length; i++) {
      var grp = namedGroups[i];
      indices.groups[grp[0]] = indices[grp[1]];
    }
  }

  return indices;
};

var setIndices = function (re, match, str, groups) {
  match.indices = makeIndicesArray(re, match, str, groups);
};

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState(re);
    var str = toString(string);
    var raw = state.raw;
    var result, reCopy, lastIndex;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      if (result && state.groups) setGroups(result, state.groups);
      if (result && state.hasIndices) setIndices(raw, result, str, state.groups);
      return result;
    }

    var groups = state.groups;
    var hasIndices = state.hasIndices;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = call(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace(flags, 'y', '');
      if (indexOf(flags, 'g') === -1) {
        flags += 'g';
      }
      strCopy = stringSlice(str, re.lastIndex);
      // Support anchored sticky behavior.
      var prevChar = re.lastIndex > 0 && charAt(str, re.lastIndex - 1);
      if (re.lastIndex > 0 &&
        (!re.multiline || re.multiline && prevChar !== '\n' && prevChar !== '\r' && prevChar !== '\u2028' && prevChar !== '\u2029')) {
        source = '(?: (?:' + source + '))';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    var match = call(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = str;
        match[0] = stringSlice(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      call(nativeReplace, match[0], reCopy, function () {
        for (var i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) setGroups(match, groups);
    if (match && hasIndices) setIndices(re, match, str, groups);

    return match;
  };
}

module.exports = patchedExec;
