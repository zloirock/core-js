'use strict';
// TODO: in core-js@4, replace the direct /modules/ requires with implicit dependencies
require('../modules/es.array.iterator');
require('../modules/es.reflect.own-keys');
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var getBuiltIn = require('../internals/get-built-in');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var USE_NATIVE_URL = require('../internals/url-constructor-detection');
var patchBody = require('../internals/url-search-params-body');
var percentCoding = require('../internals/url-percent-coding');
var defineBuiltIn = require('../internals/define-built-in');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var defineBuiltIns = require('../internals/define-built-ins');
var setToStringTag = require('../internals/set-to-string-tag');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var InternalStateModule = require('../internals/internal-state');
var anInstance = require('../internals/an-instance');
var hasOwn = require('../internals/has-own-property');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var bind = require('../internals/function-bind-context');
var anObject = require('../internals/an-object');
var isObject = require('../internals/is-object');
var toUSVString = require('../internals/to-usv-string');
var create = require('../internals/object-create');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var getIterator = require('../internals/get-iterator-internal');
var getIteratorMethod = require('../internals/get-iterator-method-internal');
var createIterResultObject = require('../internals/create-iter-result-object');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var wellKnownSymbol = require('../internals/well-known-symbol');
var arraySort = require('../internals/array-sort');

var ITERATOR = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState = InternalStateModule.set;
var hasInternalState = InternalStateModule.has;
var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);
var percentDecode = percentCoding.decode;
var percentEncode = percentCoding.encode;

var ownKeys = getBuiltIn('Reflect', 'ownKeys');
var TypeError = globalThis.TypeError;
var NativeURL = globalThis.URL;
var NativeURLSearchParams = globalThis.URLSearchParams;
var NativeURLSearchParamsPrototype = NativeURLSearchParams && NativeURLSearchParams.prototype;
var charAt = uncurryThis(''.charAt);
var join = uncurryThis([].join);
var push = uncurryThis([].push);
var replace = uncurryThis(''.replace);
var shift = uncurryThis([].shift);
var split = uncurryThis(''.split);
var stringSlice = uncurryThis(''.slice);

// Native APIs that take `URLSearchParams`, like `fetch`, recognize only native objects. Where the engine has
// a usable native `URLSearchParams`, an instance is a native object that inherits from the polyfill and whose
// internal list follows the list of the polyfill.
var nativeAppend, nativeDelete, nativeSet, nativeSort, NATIVE_DELETE_BY_VALUE;
var NATIVE_CARRIER = !!setPrototypeOf && !fails(function () {
  var params = new NativeURLSearchParams();
  nativeAppend = uncurryThis(NativeURLSearchParamsPrototype.append);
  nativeDelete = uncurryThis(NativeURLSearchParamsPrototype['delete']);
  nativeSet = uncurryThis(NativeURLSearchParamsPrototype.set);
  nativeAppend(params, 'a', '1');
  nativeAppend(params, 'b', ' +');
  nativeAppend(params, 'a', '2');
  // `set` of Firefox 29-34 leaves the other entries of the name
  nativeSet(params, 'a', '3');
  // an object with an internal state is an instance of the polyfill of another copy of core-js
  if (hasInternalState(params) || String(params) !== 'a=3&b=+%2B') return true;
  // optional native methods: without them the native list is rewritten
  nativeAppend(params, 'b', '4');
  nativeDelete(params, 'b', '4');
  NATIVE_DELETE_BY_VALUE = String(params) === 'a=3&b=+%2B';
  if (NativeURLSearchParamsPrototype.sort) nativeSort = uncurryThis(NativeURLSearchParamsPrototype.sort);
});

// `searchParams` of a URL can be replaced as a whole, and a native list can be emptied only entry by entry.
// Where a native `URL` keeps its `searchParams` in line with its query, the instance is `searchParams` of
// an own native `URL`, and the whole list is written by the native `search` setter.
var NATIVE_URL = 'http://a';
var nativeGetSearchParams, nativeSetSearch;
var NATIVE_URL_CARRIER = NATIVE_CARRIER && !fails(function () {
  var url = new NativeURL(NATIVE_URL);
  nativeGetSearchParams = uncurryThisAccessor(NativeURL.prototype, 'searchParams', 'get');
  nativeSetSearch = uncurryThisAccessor(NativeURL.prototype, 'search', 'set');
  var params = nativeGetSearchParams(url);
  nativeSetSearch(url, 'b=1&a=+%2B');
  if (hasInternalState(params) || String(params) !== 'b=1&a=+%2B') return true;
  nativeSetSearch(url, '');
  return String(params) !== '';
});

var plus = /\+/g;

// https://url.spec.whatwg.org/#urlencoded-parsing - `+` decodes to a space
var decodeQueryComponent = function (input) {
  return percentDecode(replace(input, plus, ' '));
};

var find = /[!'()~]|%20/g;

var replacements = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replacements[match];
};

var serialize = function (it) {
  return replace(percentEncode(it), find, replacer);
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    target: getInternalParamsState(params).entries,
    index: 0,
    kind: kind
  });
}, URL_SEARCH_PARAMS, function next() {
  var state = getInternalIteratorState(this);
  var target = state.target;
  var index = state.index;
  // Web IDL iterators can yield new entries after returning done.
  if (index >= target.length) return createIterResultObject(undefined, true);
  state.index++;
  var entry = target[index];
  switch (state.kind) {
    case 'keys': return createIterResultObject(entry.key, false);
    case 'values': return createIterResultObject(entry.value, false);
  } return createIterResultObject([entry.key, entry.value], false);
}, true);

var URLSearchParamsState = function (init) {
  this.entries = [];
  this.url = null;

  if (init !== undefined) {
    if (isObject(init)) this.parseObject(init);
    else {
      var query = toUSVString(init);
      this.parseQuery(charAt(query, 0) === '?' ? stringSlice(query, 1) : query);
    }
  }
};

URLSearchParamsState.prototype = {
  type: URL_SEARCH_PARAMS,
  bindURL: function (url) {
    this.url = url;
    this.update();
  },
  // `searchParams` of a URL: the instance is made at the first access to it
  getFacade: function () {
    var that = this.facade;
    if (!that) {
      that = NATIVE_URL_CARRIER
        ? setPrototypeOf(nativeGetSearchParams(this.carrier = new NativeURL(NATIVE_URL)), URLSearchParamsPrototype)
        : create(URLSearchParamsPrototype);
      setInternalState(that, this);
      this.fill();
      if (!DESCRIPTORS) that.size = this.entries.length;
    } return that;
  },
  parseObject: function (object) {
    var entries = this.entries;
    var iteratorMethod = getIteratorMethod(object);
    var index = 0;
    var iterator, next, step, entryIterator, entryNext, pair;

    if (iteratorMethod !== undefined) {
      var sequence = [];
      iterator = getIterator(object, iteratorMethod);
      next = iterator.next;
      while (!(step = anObject(call(next, iterator))).done) {
        pair = [];
        entryIterator = getIterator(anObject(step.value));
        entryNext = entryIterator.next;
        while (!(step = anObject(call(entryNext, entryIterator))).done) {
          push(pair, toUSVString(step.value));
        }
        push(sequence, pair);
      }
      // Web IDL converts the entire sequence before URLSearchParams checks pair lengths.
      while (index < sequence.length) {
        pair = sequence[index++];
        if (pair.length !== 2) throw new TypeError('Expected sequence with length 2');
        push(entries, { key: pair[0], value: pair[1] });
      }
    } else {
      var keys = ownKeys(object);
      var record = create(null);
      var key, value, stringKey;
      while (keys.length > index) {
        key = keys[index++];
        if (call(propertyIsEnumerableModule.f, object, key)) {
          stringKey = toUSVString(key);
          value = toUSVString(object[key]);
          // different property keys can become the same USVString
          if (hasOwn(record, stringKey)) record[stringKey].value = value;
          else push(entries, record[stringKey] = { key: stringKey, value: value });
        }
      }
    }
  },
  parseQuery: function (query) {
    if (query) {
      var entries = this.entries;
      var attributes = split(query, '&');
      var index = 0;
      var attribute, entry;
      while (index < attributes.length) {
        attribute = attributes[index++];
        if (attribute.length) {
          entry = split(attribute, '=');
          push(entries, {
            key: decodeQueryComponent(shift(entry)),
            value: decodeQueryComponent(join(entry, '='))
          });
        }
      }
    }
  },
  serialize: function () {
    var entries = this.entries;
    var result = [];
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      push(result, serialize(entry.key) + '=' + serialize(entry.value));
    } return join(result, '&');
  },
  update: function () {
    this.entries.length = 0;
    this.parseQuery(this.url.query);
    if (!DESCRIPTORS && this.facade) this.facade.size = this.entries.length;
    this.fill();
  },
  // writes a change of the list to the native object of the instance and to the URL: a native `method`
  // repeats the change on the native list, without it the native list is rewritten
  commit: function (method, key, value) {
    if (this.listed) {
      // a native method could take an explicit `undefined` value for a string
      if (method === nativeDelete && value === undefined) method(this.facade, key);
      else if (method) method(this.facade, key, value);
      else {
        // after a removal by value, the native list still has the removed entries of `key`
        if (key !== undefined) nativeDelete(this.facade, key);
        this.clear();
        this.fill();
      }
    }
    this.updateURL();
  },
  // a list that a mutator left as it was still updates its URL
  updateURL: function () {
    if (this.url) {
      this.url.update();
      // the query of the URL is the serialized list
      if (this.carrier) nativeSetSearch(this.carrier, this.url.query || '');
    }
  },
  // empties the native list kept by its methods, it has the keys of the entries
  clear: function () {
    var entries = this.entries;
    var index = 0;
    while (index < entries.length) nativeDelete(this.facade, entries[index++].key);
  },
  // writes the entries to the native list: emptied, or of a native `URL`
  fill: function () {
    var entries = this.entries;
    var index = 0;
    var entry;
    if (this.carrier) nativeSetSearch(this.carrier, this.serialize());
    else if (this.listed) while (index < entries.length) {
      entry = entries[index++];
      nativeAppend(this.facade, entry.key, entry.value);
    }
  }
};

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  var that = anInstance(this, URLSearchParamsPrototype);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var state = new URLSearchParamsState(init);
  // the prototype of the created object is kept for subclasses
  if (NATIVE_CARRIER) that = setPrototypeOf(new NativeURLSearchParams(), getPrototypeOf(that));
  setInternalState(that, state);
  state.listed = NATIVE_CARRIER;
  state.fill();
  if (!DESCRIPTORS) that.size = state.entries.length;
  return that;
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;
// some engines look for the native prototype in the prototype chain of an object
if (NATIVE_CARRIER) setPrototypeOf(URLSearchParamsPrototype, NativeURLSearchParamsPrototype);

defineBuiltIns(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength(arguments.length, 2);
    var key = toUSVString(name);
    var val = toUSVString(value);
    push(state.entries, { key: key, value: val });
    if (!DESCRIPTORS) this.size = state.entries.length;
    state.commit(nativeAppend, key, val);
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name /* , value */) {
    var state = getInternalParamsState(this);
    var length = validateArgumentsLength(arguments.length, 1);
    var entries = state.entries;
    var key = toUSVString(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : toUSVString($value);
    var index = 0;
    var writeIndex = 0;
    var remains = false;
    while (index < entries.length) {
      var entry = entries[index++];
      if (entry.key !== key || (value !== undefined && entry.value !== value)) {
        entries[writeIndex++] = entry;
        if (entry.key === key) remains = true;
      }
    }
    var changed = writeIndex < entries.length;
    entries.length = writeIndex;
    if (!DESCRIPTORS) this.size = entries.length;
    if (!changed) state.updateURL();
    // a removal by value that leaves no entry of the key is a removal by name
    else state.commit(!remains || NATIVE_DELETE_BY_VALUE ? nativeDelete : undefined, key, remains ? value : undefined);
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength(arguments.length, 1);
    var key = toUSVString(name);
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength(arguments.length, 1);
    var key = toUSVString(name);
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) push(result, entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name /* , value */) {
    var entries = getInternalParamsState(this).entries;
    var length = validateArgumentsLength(arguments.length, 1);
    var key = toUSVString(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : toUSVString($value);
    var index = 0;
    while (index < entries.length) {
      var entry = entries[index++];
      if (entry.key === key && (value === undefined || entry.value === value)) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength(arguments.length, 2);
    var entries = state.entries;
    var found = false;
    var key = toUSVString(name);
    var val = toUSVString(value);
    var index = 0;
    var writeIndex = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) continue;
        found = true;
        entry.value = val;
      }
      entries[writeIndex++] = entry;
    }
    entries.length = writeIndex;
    if (!found) push(entries, { key: key, value: val });
    if (!DESCRIPTORS) this.size = entries.length;
    state.commit(nativeSet, key, val);
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var index = 1;
    // the sort is stable: it leaves a list that is already in order as it is
    while (index < entries.length && entries[index - 1].key <= entries[index].key) index++;
    if (index >= entries.length) return state.updateURL();
    arraySort(entries, function (a, b) {
      return a.key > b.key ? 1 : -1;
    });
    state.commit(nativeSort);
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
defineBuiltIn(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries, { name: 'entries' });

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
defineBuiltIn(URLSearchParamsPrototype, 'toString', function toString() {
  return getInternalParamsState(this).serialize();
}, { enumerable: true });

// `URLSearchParams.prototype.size` getter
// https://url.spec.whatwg.org/#dom-urlsearchparams-size
if (DESCRIPTORS) defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
  get: function size() {
    return getInternalParamsState(this).entries.length;
  },
  configurable: true,
  enumerable: true
});

setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

// Initialize lazy native BodyInit consumers before replacing the constructor they use for brand checks.
if (!USE_NATIVE_URL) patchBody(NATIVE_URL_CARRIER);

$({ global: true, constructor: true, forced: !USE_NATIVE_URL }, {
  URLSearchParams: URLSearchParamsConstructor
});

// the state of `searchParams` of the `URL` polyfill
module.exports = URLSearchParamsState;
