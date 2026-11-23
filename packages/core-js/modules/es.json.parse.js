'use strict';
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var globalThis = require('../internals/global-this');
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');
var isArray = require('../internals/is-array');
var hasOwn = require('../internals/has-own-property');
var sameValue = require('../internals/same-value');
var toString = require('../internals/to-string');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var createProperty = require('../internals/create-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var fails = require('../internals/fails');
var parseJSONString = require('../internals/parse-json-string');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

var JSON = globalThis.JSON;
var Reflect = globalThis.Reflect;
var Number = globalThis.Number;
var SyntaxError = globalThis.SyntaxError;
var nativeParse = JSON && JSON.parse;
var reflectDefineProperty = Reflect && Reflect.defineProperty;
var reflectDeleteProperty = Reflect && Reflect.deleteProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible = Object.isExtensible;
var at = uncurryThis(''.charAt);
var concat = uncurryThis(''.concat);
var indexOf = uncurryThis(''.indexOf);
var slice = uncurryThis(''.slice);
var exec = uncurryThis(/./.exec);
var push = uncurryThis([].push);

var IS_DIGIT = /^\d$/;
var IS_NON_ZERO_DIGIT = /^[1-9]$/;
var IS_NUMBER_START = /^[\d-]$/;
var IS_WHITESPACE = /^[\t\n\r ]$/;
// eslint-disable-next-line regexp/no-control-character -- these characters must be escaped in JSON strings
var MUST_ESCAPE = /[\u0000-\u001F"\\]/;

// old Edge throws instead of returning false
if (reflectDefineProperty && fails(function () {
  reflectDefineProperty([], 'length', { configurable: true });
})) reflectDefineProperty = undefined;

var $parse = function (source, reviver) {
  var context = new Context(source);
  var root = context.parse();
  var value = root.value;
  var endIndex = context.skip(IS_WHITESPACE, root.end);
  if (endIndex < source.length) {
    throw new SyntaxError('Unexpected extra character: "' + at(source, endIndex) + '" after the parsed data at: ' + endIndex);
  }
  return isCallable(reviver) ? internalize({ '': value }, '', reviver, root) : value;
};

var internalize = function (holder, name, reviver, node) {
  var val = holder[name];
  var unmodified = node && sameValue(val, node.value);
  var context = unmodified && typeof node.source == 'string' ? { source: node.source } : {};
  var elementRecordsLen, keys, len, i, P;
  if (isObject(val)) {
    var nodeIsArray = isArray(val);
    var nodes = unmodified ? node.nodes : nodeIsArray ? [] : {};
    if (nodeIsArray) {
      elementRecordsLen = nodes.length;
      len = lengthOfArrayLike(val);
      for (i = 0; i < len; i++) {
        internalizeProperty(val, i, internalize(val, '' + i, reviver, i < elementRecordsLen ? nodes[i] : undefined), unmodified);
      }
    } else {
      keys = getBuiltIn('Object', 'keys')(val);
      len = lengthOfArrayLike(keys);
      for (i = 0; i < len; i++) {
        P = keys[i];
        internalizeProperty(val, P, internalize(val, P, reviver, hasOwn(nodes, P) ? nodes[P] : undefined), unmodified);
      }
    }
  }
  return call(reviver, holder, name, val, context);
};

var setProperty = function (object, key, value, update) {
  // Old WebKit moves an existing data property to the end when defineProperty changes its value.
  if (update) object[key] = value;
  else createProperty(object, key, value);
};

var internalizeProperty = function (object, key, value, original) {
  // objects created by the parser cannot be proxies
  var method = !original && (value === undefined ? reflectDeleteProperty : reflectDefineProperty);
  if (method) {
    if (value === undefined) method(object, key);
    else method(object, key, createPropertyDescriptor(0, value));
    return;
  }
  var update;
  // exact Proxy semantics require correct Reflect operations
  if (DESCRIPTORS) {
    var descriptor = getOwnPropertyDescriptor(object, key);
    if (descriptor) {
      if (!descriptor.configurable) return;
      update = original && descriptor.enumerable && hasOwn(descriptor, 'writable') && descriptor.writable;
    } else if (value !== undefined) {
      if (isExtensible && !isExtensible(object)) return;
      if (isArray(object) && key >= object.length && !getOwnPropertyDescriptor(object, 'length').writable) return;
    }
  }
  if (value === undefined) delete object[key];
  else setProperty(object, key, value, update);
};

var Node = function (value, end, source, nodes) {
  this.value = value;
  this.end = end;
  this.source = source;
  this.nodes = nodes;
};

var Context = function (source) {
  this.source = source;
};

// https://www.json.org/json-en.html
Context.prototype = {
  parse: function () {
    var source = this.source;
    var i = this.skip(IS_WHITESPACE, 0);
    var frame, node, chr, array, key;
    // Each frame holds an open container. Closing it produces a node for its parent.
    while (true) {
      if (node) {
        if (!frame) return node;
        if (frame.close === ']') {
          push(frame.nodes, node);
          push(frame.value, node.value);
        } else {
          createProperty(frame.nodes, frame.key, node);
          setProperty(frame.value, frame.key, node.value, hasOwn(frame.value, frame.key));
        }
        i = this.until([',', frame.close], node.end);
      } else {
        chr = at(source, i);
        if (chr !== '{' && chr !== '[') {
          node = this.primitive(chr, i);
          continue;
        }
        array = chr === '[';
        frame = { parent: frame, close: array ? ']' : '}', value: array ? [] : {}, nodes: array ? [] : {}, key: '' };
        i = this.skip(IS_WHITESPACE, i + 1);
      }
      if (at(source, i) === frame.close) {
        node = new Node(frame.value, i + 1, null, frame.nodes);
        frame = frame.parent;
        continue;
      }
      // A completed child is followed by a comma here. Require another key or element.
      if (node) {
        i = this.skip(IS_WHITESPACE, i + 1);
        node = undefined;
      }
      if (i === source.length) throw new SyntaxError('Unterminated ' + (frame.close === ']' ? 'array' : 'object') + ' at: ' + i);
      if (frame.close === '}') {
        key = this.string(this.until(['"'], i));
        frame.key = key.value;
        i = this.skip(IS_WHITESPACE, this.until([':'], key.end) + 1);
      }
    }
  },
  primitive: function (chr, i) {
    if (exec(IS_NUMBER_START, chr)) return this.number(i);
    switch (chr) {
      case '"':
        return this.string(i);
      case 't':
        return this.keyword(true, i);
      case 'f':
        return this.keyword(false, i);
      case 'n':
        return this.keyword(null, i);
    } throw new SyntaxError('Unexpected character: "' + chr + '" at: ' + i);
  },
  node: function (value, start, end) {
    return new Node(value, end, slice(this.source, start, end));
  },
  string: function (index) {
    var parsed = parseJSONString(this.source, index + 1);
    return this.node(parsed.value, index, parsed.end);
  },
  number: function (startIndex) {
    var source = this.source;
    var i = startIndex;
    if (at(source, i) === '-') i++;
    if (at(source, i) === '0') i++;
    else if (exec(IS_NON_ZERO_DIGIT, at(source, i))) i = this.skip(IS_DIGIT, i + 1);
    else throw new SyntaxError('Failed to parse number at: ' + i);
    if (at(source, i) === '.') {
      var fractionStartIndex = i + 1;
      i = this.skip(IS_DIGIT, fractionStartIndex);
      if (fractionStartIndex === i) throw new SyntaxError("Failed to parse number's fraction at: " + i);
    }
    if (at(source, i) === 'e' || at(source, i) === 'E') {
      i++;
      if (at(source, i) === '+' || at(source, i) === '-') i++;
      var exponentStartIndex = i;
      i = this.skip(IS_DIGIT, i);
      if (exponentStartIndex === i) throw new SyntaxError("Failed to parse number's exponent value at: " + i);
    }
    return this.node(Number(slice(source, startIndex, i)), startIndex, i);
  },
  keyword: function (value, index) {
    var keyword = '' + value;
    var endIndex = index + keyword.length;
    if (slice(this.source, index, endIndex) !== keyword) throw new SyntaxError('Failed to parse value at: ' + index);
    return this.node(value, index, endIndex);
  },
  skip: function (regex, i) {
    var source = this.source;
    for (; i < source.length; i++) if (!exec(regex, at(source, i))) break;
    return i;
  },
  until: function (array, i) {
    i = this.skip(IS_WHITESPACE, i);
    var chr = at(this.source, i);
    for (var j = 0; j < array.length; j++) if (array[j] === chr) return i;
    throw new SyntaxError('Unexpected character: "' + chr + '" at: ' + i);
  }
};

var NO_SOURCE_SUPPORT = fails(function () {
  var unsafeInt = '9007199254740993';
  var source;
  nativeParse(unsafeInt, function (key, value, context) {
    source = context.source;
  });
  return source !== unsafeInt;
});

var PROPER_BASE_PARSE = !fails(function () {
  // Safari 9 and old Rhino lose the sign of -0
  return 1 / nativeParse('-0 \t') !== -Infinity;
}) && fails(function () {
  // IE accepts numbers with leading zeros
  nativeParse('01');
});

// V8 ~ Chrome 128-155, NodeJS 23.0-24.22.0 and 25.0-26.12.0 can take the name of an escaped key
// from an earlier object with the same preceding keys, https://issues.chromium.org/issues/521080746
var SAFE_ESCAPED_KEYS = !fails(function () {
  // the nested object is built first, and its rare first key keeps the shared shape free of other continuations
  return !nativeParse('{"`":0,"\\t":{"`":0,"\\\\":0}}')['\t'];
});

var closingQuote = function (source, index) {
  var start;
  do {
    index = indexOf(source, '"', index + 1);
    if (index === -1) return -1;
    start = index;
    while (at(source, start - 1) === '\\') start--;
  } while ((index - start) % 2);
  return index;
};

var normalizeKeys = function (source) {
  var backslash = indexOf(source, '\\');
  if (backslash === -1 || indexOf(source, ':', backslash) === -1) return source;
  var result = '';
  var copied = 0;
  var start, end, i, key;
  do {
    end = closingQuote(source, backslash);
    if (end === -1) return;
    i = end + 1;
    while (exec(IS_WHITESPACE, at(source, i))) i++;
    if (at(source, i) === ':') {
      // Locate the opening quote before rewriting. A backslash outside a string must stay invalid.
      i = copied;
      do {
        start = indexOf(source, '"', i);
        if (start === -1 || start > backslash) return;
        i = closingQuote(source, start) + 1;
      } while (i <= backslash);
      // V8 can decode the key as a standalone string. Only insert it if it can be written literally.
      key = nativeParse(slice(source, start, end + 1));
      if (exec(MUST_ESCAPE, key)) return;
      result += slice(source, copied, start + 1) + key + '"';
      copied = end + 1;
    }
    backslash = indexOf(source, '\\', end + 1);
  } while (backslash !== -1);
  return copied ? result + slice(source, copied) : source;
};

// `JSON.parse` method
// https://tc39.es/ecma262/#sec-json.parse
// https://github.com/tc39/proposal-json-parse-with-source
$({ target: 'JSON', stat: true, forced: NO_SOURCE_SUPPORT || !PROPER_BASE_PARSE || !SAFE_ESCAPED_KEYS }, {
  parse: function parse(text, reviver) {
    // Native concatenation uses the string hint and rejects symbols. Shimmed symbols need our ToString.
    if (typeof text != 'string') text = NATIVE_SYMBOL ? concat('', text) : toString(text);
    if (PROPER_BASE_PARSE && (!NO_SOURCE_SUPPORT || !isCallable(reviver))) {
      var source = SAFE_ESCAPED_KEYS ? text : normalizeKeys(text);
      if (source !== undefined) return nativeParse(source, reviver);
    }
    return $parse(text, reviver);
  }
});
