'use strict';
var defineBuiltIn = require('../internals/define-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var create = require('../internals/object-create');
var hasOwn = require('../internals/has-own-property');
var toUSVString = require('../internals/to-usv-string');
var validateArgumentsLength = require('../internals/validate-arguments-length');

var $URLSearchParams = URLSearchParams;
var URLSearchParamsPrototype = $URLSearchParams.prototype;
var append = uncurryThis(URLSearchParamsPrototype.append);
var $delete = uncurryThis(URLSearchParamsPrototype['delete']);
var forEach = uncurryThis(URLSearchParamsPrototype.forEach);
var has = uncurryThis(URLSearchParamsPrototype.has);
var push = uncurryThis([].push);
var params = new $URLSearchParams('a=1&a=2&b=3');

params['delete']('a', 1);
// `undefined` case is a Chromium 117 bug
// https://issues.chromium.org/issues/40278437
params['delete']('b', undefined);

if (params + '' !== 'a=2') {
  defineBuiltIn(URLSearchParamsPrototype, 'delete', function (name /* , value */) {
    var length = arguments.length;
    var $value = length < 2 ? undefined : arguments[1];
    if (length && $value === undefined) return $delete(this, name);
    var entries = [];
    var firstIndexes = create(null);
    forEach(this, function (v, k) { // also validates `this`
      if (!hasOwn(firstIndexes, k)) firstIndexes[k] = entries.length;
      push(entries, { key: k, value: v });
    });
    validateArgumentsLength(length, 1);
    var key = toUSVString(name);
    var value = toUSVString($value);
    var entriesLength = entries.length;
    var start = firstIndexes[key];
    var index = start;
    var matched = false;
    var retained = false;
    var entry;
    while (index < entriesLength) {
      entry = entries[index++];
      if (entry.key === key) {
        if (entry.value === value) matched = true;
        else retained = true;
      }
    }
    if (!retained) return $delete(this, key);
    if (!matched) {
      // Use a key absent after conversion to trigger the URL update without a match.
      while (hasOwn(firstIndexes, key) || has(this, key)) key += '\0';
      return $delete(this, key);
    }
    // Keep the prefix, extending the tail back over keys shared with it.
    index = entriesLength;
    while (index > start) {
      entry = entries[--index];
      if (firstIndexes[entry.key] < start) start = firstIndexes[entry.key];
    }
    index = start;
    while (index < entriesLength) {
      entry = entries[index];
      if (firstIndexes[entry.key] === index++) $delete(this, entry.key);
    }
    index = start;
    while (index < entriesLength) {
      entry = entries[index++];
      if (!(entry.key === key && entry.value === value)) append(this, entry.key, entry.value);
    }
  }, { enumerable: true, unsafe: true });
}
