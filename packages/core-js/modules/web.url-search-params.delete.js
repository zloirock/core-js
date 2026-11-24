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
var set = uncurryThis(URLSearchParamsPrototype.set);
var push = uncurryThis([].push);
var params = new $URLSearchParams('a=1&a=2&b=3');

params['delete']('a', 1);
// `undefined` case is a Chromium 117 bug
// https://issues.chromium.org/issues/40278437
params['delete']('b', undefined);

if (params + '' !== 'a=2') {
  defineBuiltIn(URLSearchParamsPrototype, 'delete', function (name /* , value */) {
    var length = arguments.length;
    var value = length < 2 ? undefined : arguments[1];
    // Check the receiver before converting user arguments.
    if (typeof name != 'string' || (value !== undefined && typeof value != 'string')) has(this, '');
    validateArgumentsLength(length, 1);
    var key = toUSVString(name);
    if (value === undefined) return $delete(this, key);
    value = toUSVString(value);
    var entries = [];
    var firstIndexes = create(null);
    var start;
    var matched = false;
    forEach(this, function (v, k) {
      if (k === key) {
        if (start === undefined) start = entries.length;
        if (v === value) {
          matched = true;
          return;
        }
      }
      if (!hasOwn(firstIndexes, k)) firstIndexes[k] = entries.length;
      push(entries, { key: k, value: v });
    });
    if (!hasOwn(firstIndexes, key)) return $delete(this, key);
    if (!matched) {
      // Even without a match, deleting must run the URL update steps.
      while (hasOwn(firstIndexes, key)) key += '\0';
      return $delete(this, key);
    }
    // Keep the prefix, extending the tail back over keys shared with it.
    var entriesLength = entries.length;
    var index = entriesLength;
    var entry;
    while (index > start) {
      entry = entries[--index];
      if (firstIndexes[entry.key] < start) start = firstIndexes[entry.key];
    }
    // Keep the first surviving entry in place so a bound URL never loses its query.
    entry = entries[start];
    set(this, entry.key, entry.value);
    index = start + 1;
    while (index < entriesLength) {
      entry = entries[index];
      if (firstIndexes[entry.key] === index++) $delete(this, entry.key);
    }
    index = start + 1;
    while (index < entriesLength) {
      entry = entries[index++];
      append(this, entry.key, entry.value);
    }
  }, { enumerable: true, unsafe: true });
}
