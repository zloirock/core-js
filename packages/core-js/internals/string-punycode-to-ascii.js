'use strict';
// based on https://github.com/mathiasbynens/punycode.js/blob/main/punycode.js
// TODO: in core-js@4, replace the direct /modules/ require with an implicit dependency
require('../modules/es.array.sort');
var uncurryThis = require('../internals/function-uncurry-this');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');

var arraySort = uncurryThis(getBuiltInPrototypeMethod('Array', 'sort'));

var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var baseMinusTMin = base - tMin;

var exec = uncurryThis(regexSeparators.exec);
var floor = Math.floor;
var fromCharCode = String.fromCharCode;
var charCodeAt = uncurryThis(''.charCodeAt);
var join = uncurryThis([].join);
var push = uncurryThis([].push);
var replace = uncurryThis(''.replace);
var split = uncurryThis(''.split);

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = charCodeAt(string, counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = charCodeAt(string, counter++);
      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
        push(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        push(output, value);
        counter--;
      }
    } else {
      push(output, value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://datatracker.ietf.org/doc/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  while (delta > baseMinusTMin * tMax >> 1) {
    delta = floor(delta / baseMinusTMin);
    k += base;
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

// Represent delta as a generalized variable-length integer.
var encodeDelta = function (delta, bias, output) {
  var k = base;
  while (true) {
    var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
    if (delta < t) break;
    var deltaMinusT = delta - t;
    var baseMinusT = base - t;
    push(output, fromCharCode(digitToBasic(t + deltaMinusT % baseMinusT)));
    delta = floor(deltaMinusT / baseMinusT);
    k += base;
  }
  push(output, fromCharCode(digitToBasic(delta)));
};

// Build a Fenwick tree of handled positions in linear time.
var buildTree = function (tree) {
  var length = tree.length;
  for (var i = 1; i < length; i++) {
    var j = i + (i & -i);
    if (j < length) tree[j] += tree[i];
  }
};

var countBefore = function (tree, index) {
  var count = 0;
  for (; index > 0; index -= index & -index) count += tree[index];
  return count;
};

var addPosition = function (tree, index) {
  for (index++; index < tree.length; index += index & -index) tree[index]++;
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
var encode = function (input) {
  var output = [];
  var order = [];
  var tree = [0];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue, count;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    tree[i + 1] = currentValue < 0x80 ? 1 : 0;
    if (currentValue < 0x80) {
      push(output, fromCharCode(currentValue));
    } else {
      push(order, i);
    }
  }

  // Sort positions by code point, keeping repeated code points in input order.
  arraySort(order, function (a, b) {
    return input[a] - input[b] || a - b;
  });

  buildTree(tree);

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    push(output, delimiter);
  }

  // Handle each distinct non-basic code point without rescanning the whole label.
  var start = 0;
  while (start < order.length) {
    var m = input[order[start]];
    var end = start;
    while (end < order.length && input[order[end]] === m) end++;

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledBefore = handledCPCount;
    if (m - n > floor((maxInt - delta) / (handledBefore + 1))) {
      return null;
    }

    delta += (m - n) * (handledBefore + 1);
    n = m;

    var previousCount = 0;
    for (i = start; i < end; i++) {
      // Count handled positions before this occurrence, excluding earlier occurrences of m.
      count = countBefore(tree, order[i]);
      if (count - previousCount > maxInt - delta) return null;
      delta += count - previousCount;
      previousCount = count;

      encodeDelta(delta, bias, output);
      bias = adapt(delta, handledBefore + 1, handledCPCount === basicLength);
      delta = 0;
      handledCPCount++;
    }

    // Preserve the reference algorithm's trailing increments and overflow check.
    count = handledBefore - previousCount;
    if (count > maxInt - delta) return null;
    delta += count;

    // Equal code points become handled together, after their deltas have been emitted.
    if (end < order.length) {
      for (i = start; i < end; i++) {
        addPosition(tree, order[i]);
      }
    }

    delta++;
    n++;
    start = end;
  }
  return join(output, '');
};

module.exports = function (input) {
  var encoded = [];
  var labels = split(replace(input, regexSeparators, '\u002E'), '.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    if (exec(regexNonASCII, label)) {
      label = encode(label);
      if (label === null) return null;
      label = 'xn--' + label;
    }
    push(encoded, label);
  }
  return join(encoded, '.');
};
