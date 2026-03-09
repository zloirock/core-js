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
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt = uncurryThis(''.charAt);
var indexOf = uncurryThis(''.indexOf);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);

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

// Get the correct position for each captured group
// This implementation provides best-effort indices calculation
// It works correctly for most common cases but may have limitations
// with complex patterns like overlapping groups or backreferences
var getCapturePositions = function (match, str) {
  var positions = [];
  var matchStart = match.index;
  var matchString = match[0];
  var matchEnd = matchStart + matchString.length;

  // Position 0 is the entire match
  positions[0] = [matchStart, matchEnd];

  // Track the last found position to handle duplicate captured strings
  var lastFoundPos = 0;

  for (var i = 1; i < match.length; i++) {
    var captured = match[i];

    if (captured === undefined) {
      // Non-participating capturing group
      positions[i] = undefined;
    } else if (captured === '') {
      // Empty capture - position follows the previous captured group's end
      // or is at matchStart if this is the first capture
      positions[i] = [matchStart + lastFoundPos, matchStart + lastFoundPos];
    } else {
      // First try to find the captured string within the match string
      // Start searching from the last found position to handle duplicate strings
      var foundIndex = indexOf(matchString, captured, lastFoundPos);

      if (foundIndex !== -1 && foundIndex + captured.length <= matchString.length) {
        positions[i] = [matchStart + foundIndex, matchStart + foundIndex + captured.length];
        // Update last found position to after this capture for next iteration
        lastFoundPos = foundIndex + captured.length;
      } else {
        // Captured string not found in match[0] — this happens with lookahead/lookbehind
        // capturing groups whose content is outside the consumed match.
        // Search in the full input string starting from the match position.
        var strIndex = indexOf(str, captured, matchStart);
        if (strIndex !== -1) {
          positions[i] = [strIndex, strIndex + captured.length];
          // Update last found position even for lookahead/lookbehind captures
          lastFoundPos = strIndex + captured.length - matchStart;
        } else {
          // Fallback: should not normally happen
          positions[i] = undefined;
        }
      }
    }
  }

  return positions;
};

// MakeIndicesArray implementation per TC39 spec
var makeIndicesArray = function (match, str, groups) {
  var hasGroups = groups && groups.length > 0;
  var positions = getCapturePositions(match, str);
  var length = match.length;
  var indices = [];
  indices.length = length;

  if (hasGroups) {
    indices.groups = create(null);
  }

  for (var i = 0; i < length; i++) {
    indices[i] = positions[i];
  }

  if (hasGroups) {
    for (var j = 0; j < groups.length; j++) {
      var group = groups[j];
      var groupIndex = group[1];
      if (indices[groupIndex] !== undefined) {
        indices.groups[group[0]] = indices[groupIndex];
      }
    }
  }

  return indices;
};

var setIndices = function (match, str, groups) {
  match.indices = makeIndicesArray(match, str, groups);
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
      if (result && state.hasIndices) setIndices(result, str, state.groups);

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

    if (match && hasIndices) setIndices(match, str, groups);

    return match;
  };
}

module.exports = patchedExec;
