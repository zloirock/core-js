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
var UNSUPPORTED_HAS_INDICES = require('../internals/regexp-unsupported-has-indices');
var UNSUPPORTED_NCG = require('../internals/regexp-unsupported-ncg');

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

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_HAS_INDICES || UNSUPPORTED_NCG;

var setGroups = function (re, groups) {
  var object = re.groups = create(null);
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    object[group[0]] = re[group[1]];
  }
};

// Compute match indices for the 'd' flag polyfill
var getGroupNesting = function (source) {
  // Returns array where nesting[i] is the parent group index of capturing group i (0 = top level)
  var nesting = [0]; // nesting[0] unused (index 0 is the full match)
  var stack = [0]; // stack of current group IDs; 0 = top level
  var groupId = 0;
  var inCharClass = false;
  for (var i = 0; i < source.length; i++) {
    var ch = charAt(source, i);
    if (ch === '\\') {
      i++;
      continue;
    }
    if (inCharClass) {
      if (ch === ']') inCharClass = false;
      continue;
    }
    if (ch === '[') {
      inCharClass = true;
      continue;
    }
    if (ch === '(') {
      var next = charAt(source, i + 1);
      if (next === '?') {
        var next2 = charAt(source, i + 2);
        if (next2 === '<' && charAt(source, i + 3) !== '=' && charAt(source, i + 3) !== '!') {
          // Named capturing group (?<name>...)
          groupId++;
          nesting[groupId] = stack[stack.length - 1];
          stack[stack.length] = groupId;
        } else {
          // Non-capturing group or assertion
          stack[stack.length] = -1;
        }
      } else {
        // Regular capturing group
        groupId++;
        nesting[groupId] = stack[stack.length - 1];
        stack[stack.length] = groupId;
      }
    } else if (ch === ')') {
      stack.length--;
    }
  }
  return nesting;
};

var getNamedGroups = function (source) {
  // Extract named capture groups: returns array of [name, groupIndex] pairs
  var named = [];
  var groupId = 0;
  var inCharClass = false;
  for (var i = 0; i < source.length; i++) {
    var ch = charAt(source, i);
    if (ch === '\\') {
      i++;
      continue;
    }
    if (inCharClass) {
      if (ch === ']') inCharClass = false;
      continue;
    }
    if (ch === '[') {
      inCharClass = true;
      continue;
    }
    if (ch === '(') {
      var next = charAt(source, i + 1);
      if (next === '?') {
        var next2 = charAt(source, i + 2);
        if (next2 === '<' && charAt(source, i + 3) !== '=' && charAt(source, i + 3) !== '!') {
          // Named capturing group
          groupId++;
          var nameStart = i + 3;
          var nameEnd = indexOf(source, '>', nameStart);
          named[named.length] = [stringSlice(source, nameStart, nameEnd), groupId];
          i = nameEnd;
        }
      } else {
        groupId++;
      }
    }
  }
  return named;
};

var setIndices = function (match, input, state) {
  var indices = new Array(match.length);
  var matchStart = match.index;
  var matchEnd = matchStart + match[0].length;

  // Full match indices
  indices[0] = [matchStart, matchEnd];

  if (match.length > 1) {
    // Parse group nesting from the regex source
    var re = state.self || match;
    var regexSource = re.source !== undefined ? re.source : '';
    var nesting = getGroupNesting(regexSource);

    for (var i = 1; i < match.length; i++) {
      if (match[i] === undefined) {
        indices[i] = undefined;
        continue;
      }

      var groupText = match[i];
      var parent = i < nesting.length ? nesting[i] : 0;
      var searchStart;

      if (parent > 0 && indices[parent] !== undefined) {
        searchStart = indices[parent][0];
      } else {
        searchStart = matchStart;
      }

      // Search after previous sibling group's end to handle sequential groups correctly
      for (var j = i - 1; j > 0; j--) {
        var siblingParent = j < nesting.length ? nesting[j] : 0;
        if (siblingParent === (i < nesting.length ? nesting[i] : 0) && indices[j] !== undefined) {
          searchStart = Math.max(indices[j][1], searchStart);
          break;
        }
      }

      var searchEnd = parent > 0 && indices[parent] !== undefined ? indices[parent][1] : matchEnd;
      var pos = indexOf(input, groupText, searchStart);

      if (pos !== -1 && pos + groupText.length <= searchEnd) {
        indices[i] = [pos, pos + groupText.length];
      } else {
        // Fallback: search from match start
        pos = indexOf(input, groupText, matchStart);
        if (pos !== -1 && pos + groupText.length <= matchEnd) {
          indices[i] = [pos, pos + groupText.length];
        } else {
          indices[i] = undefined;
        }
      }
    }
  }

  // Named groups
  var groups = state.groups;
  if (groups) {
    var namedIndices = indices.groups = create(null);
    for (var k = 0; k < groups.length; k++) {
      namedIndices[groups[k][0]] = indices[groups[k][1]];
    }
  } else {
    // If NCG is natively supported, extract named groups from source
    var re2 = state.self;
    if (re2 && re2.source) {
      var namedFromSource = getNamedGroups(re2.source);
      if (namedFromSource.length) {
        var namedIndices2 = indices.groups = create(null);
        for (var m = 0; m < namedFromSource.length; m++) {
          namedIndices2[namedFromSource[m][0]] = indices[namedFromSource[m][1]];
        }
      }
    }
  }

  return indices;
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
      if (result && state.hasIndices) {
        state.self = re;
        result.indices = setIndices(result, str, state);
      }

      return result;
    }

    var groups = state.groups;
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
    if (match && state.hasIndices) {
      state.self = re;
      match.indices = setIndices(match, str, state);
    }

    return match;
  };
}

module.exports = patchedExec;
