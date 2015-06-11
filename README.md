# core-js<sup>[![version](http://vb.teelaun.ch/zloirock/core-js.svg)](https://www.npmjs.org/package/core-js/)</sup>

[![NPM](https://nodei.co/npm/core-js.png?downloads=true)](https://www.npmjs.org/package/core-js/)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/zloirock/core-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/zloirock/core-js.png)](https://travis-ci.org/zloirock/core-js) [![Dependency Status](https://david-dm.org/zloirock/core-js.svg)](https://david-dm.org/zloirock/core-js) [![devDependency Status](https://david-dm.org/zloirock/core-js/dev-status.svg)](https://david-dm.org/zloirock/core-js#info=devDependencies)

Modular compact standard library for JavaScript. Includes polyfills for [ECMAScript 5](#ecmascript-5), [ECMAScript 6](#ecmascript-6): [symbols](#ecmascript-6-symbols), [collections](#ecmascript-6-collections), [iterators](#ecmascript-6-iterators), [promises](#ecmascript-6-promises), [ECMAScript 7 proposals](#ecmascript-7); [setImmediate](#setimmediate), [array generics](#mozilla-javascript-array-generics). Some additional features such as [dictionaries](#dict), [extended partial application](#partial-application), [console cap](#console), [date formatting](#date-formatting). You can require only standardized features polyfills, use features without global namespace pollution or create a custom build.

[Example](http://goo.gl/mfHYm2):
```javascript
Array.from(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]
'*'.repeat(10);                       // => '**********'
Promise.resolve(32).then(log);        // => 32
setImmediate(log, 42);                // => 42
```

[Without global namespace pollution](http://goo.gl/WBhs43):
```javascript
var core = require('core-js/library'); // With a modular system, otherwise use global `core`
core.Array.from(new core.Set([1, 2, 3, 2, 1])); // => [1, 2, 3]
core.String.repeat('*', 10);                    // => '**********'
core.Promise.resolve(32).then(core.log);        // => 32
core.setImmediate(core.log, 42);                // => 42
```

- [Usage](#usage)
  - [Basic](#basic)
  - [CommonJS](#commonjs)
  - [Custom build](#custom-build)
- [API](#api)
  - [ECMAScript 5](#ecmascript-5)
  - [ECMAScript 6](#ecmascript-6)
  - [ECMAScript 6: Symbols](#ecmascript-6-symbols)
  - [ECMAScript 6: Collections](#ecmascript-6-collections)
  - [ECMAScript 6: Iterators](#ecmascript-6-iterators)
  - [ECMAScript 6: Promises](#ecmascript-6-promises)
  - [ECMAScript 6: Reflect](#ecmascript-6-reflect)
  - [ECMAScript 7](#ecmascript-7)
  - [Mozilla JavaScript: Array generics](#mozilla-javascript-array-generics)
  - [setTimeout / setInterval](#settimeout--setinterval)
  - [setImmediate](#setimmediate)
  - [console](#console)
  - [Object](#object)
  - [Dict](#dict)
  - [Partial application](#partial-application)
  - [Date formatting](#date-formatting)
  - [Array](#array)
  - [Number](#number)
  - [Escaping characters](#escaping-characters)
  - [delay](#delay)
- [Changelog](#changelog)

## Usage
### Basic
```
npm i core-js
bower install core.js
```

```javascript
// Default
require('core-js');
// Without global namespace pollution
var core = require('core-js/library');
// Shim only
require('core-js/shim');
```
If you need complete build for browser, use builds from `core-js/client` path:  [default](https://raw.githack.com/zloirock/core-js/master/client/core.min.js), [without global namespace pollution](https://raw.githack.com/zloirock/core-js/master/client/library.min.js), [shim only](https://raw.githack.com/zloirock/core-js/master/client/shim.min.js).

Caveat: if you uses `core-js` with extension of native objects, require all needed `core-js` modules at the beginning of entry point of your application, otherwise possible conflicts.
### CommonJS
You can require only needed modules.

```js
require('core-js/es5'); // if you need support IE8-
require('core-js/fn/set');
require('core-js/fn/array/from');
Array.from(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]

// or, w/o global namespace pollution:

var core = require('core-js/library/es5'); // if you need support IE8-
var Set  = require('core-js/library/fn/set');
var from = require('core-js/library/fn/array/from');
from(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]
```
Available entry points for methods / constructors, as above, excluding features from [`es5`](#ecmascript-5) module (this module requires fully in ES3 environment before all other modules).

Available namespaces: for example, `core-js/es6/array` (`core-js/library/es6/array`) contains all [ES6 `Array` features](#ecmascript-6-array), `core-js/es6` (`core-js/library/es6`) contains all ES6 features.

Available (but not recommended - possible changing modules structure in future versions) inclusion by module name, for example, `es6.object.statics-accept-primitives` - `core-js/modules/es6.object.statics-accept-primitives` or `core-js/library/modules/es6.object.statics-accept-primitives`.
### Custom build
```
npm i core-js && cd node_modules/core-js && npm i
npm run grunt build:core.dict,es6 -- --blacklist=es6.promise,es6.math --library=on --path=custom uglify
```
Where `core.dict` and `es6` are modules (namespaces) names, which will be added to the build, `es6.promise` and `es6.math` are modules (namespaces) names, which will be excluded from the build, `--library=on` is flag for build without global namespace pollution and `custom` is target file name.

Available namespaces: for example, `es6.array` contains [ES6 `Array` features](#ecmascript-6-array), `es6` contains all modules whose names start with `es6`.

Available custom build from js code (required `webpack`):
```js
require('core-js/build')({
  modules: ['es6', 'core.dict'], // modules / namespaces
  blacklist: ['es6.reflect'],    // blacklist of modules / namespaces
  library: false,                // flag for build without global namespace pollution
}, function(err, code){          // callback
  // ...
});
```
## API:
### ECMAScript 5
Module `es5`, nothing new - without examples.
```javascript
Object
  .create(proto | null, descriptors?) -> object
  .getPrototypeOf(object) -> proto | null
  .defineProperty(target, key, desc) -> target, cap for ie8-
  .defineProperties(target, descriptors) -> target, cap for ie8-
  .getOwnPropertyDescriptor(object, key) -> desc
  .getOwnPropertyNames(object) -> array
  .seal(object) -> object, cap for ie8-
  .freeze(object) -> object, cap for ie8-
  .preventExtensions(object) -> object, cap for ie8-
  .isSealed(object) -> bool, cap for ie8-
  .isFrozen(object) -> bool, cap for ie8-
  .isExtensible(object) -> bool, cap for ie8-
  .keys(object) -> array
Array
  .isArray(var) -> bool
  #slice(start?, end?) -> array, fix for ie7-
  #join(string = ',') -> string, fix for ie7-
  #indexOf(var, from?) -> int
  #lastIndexOf(var, from?) -> int
  #every(fn(val, index, @), that) -> bool
  #some(fn(val, index, @), that) -> bool
  #forEach(fn(val, index, @), that) -> void
  #map(fn(val, index, @), that) -> array
  #filter(fn(val, index, @), that) -> array
  #reduce(fn(memo, val, index, @), memo?) -> var
  #reduceRight(fn(memo, val, index, @), memo?) -> var
Function
  #bind(object, ...args) -> boundFn(...args)
String
  #trim() -> str
Date
  .now() -> int
  #toISOString() -> string
```

### ECMAScript 6
#### ECMAScript 6: Object & Function
Modules `es6.object.assign`, `es6.object.is`, `es6.object.set-prototype-of`, `es6.object.to-string`, `es6.function.name` and `es6.function.has-instance`.
```javascript
Object
  .assign(target, ...src) -> target
  .is(a, b) -> bool
  .setPrototypeOf(target, proto | null) -> target, sham (required __proto__)
  #toString() -> string, ES6 fix: @@toStringTag support
Function
  #name -> string (IE9+)
  #@@hasInstance(var) -> bool
```
[Example](http://goo.gl/UN5ZDT):
```javascript
var foo = {q: 1, w: 2}
  , bar = {e: 3, r: 4}
  , baz = {t: 5, y: 6};
Object.assign(foo, bar, baz); // => foo = {q: 1, w: 2, e: 3, r: 4, t: 5, y: 6}

Object.is(NaN, NaN); // => true
Object.is(0, -0);    // => false
Object.is(42, 42);   // => true
Object.is(42, '42'); // => false

function Parent(){}
function Child(){}
Object.setPrototypeOf(Child.prototype, Parent.prototype);
new Child instanceof Child;  // => true
new Child instanceof Parent; // => true

var O = {};
O[Symbol.toStringTag] = 'Foo';
'' + O; // => '[object Foo]'

(function foo(){}).name // => 'foo'
```
Module `es6.object.statics-accept-primitives`. In ES6 most `Object` static methods should work with primitives. [Example](http://goo.gl/35lPSi):
```javascript
Object.keys('qwe'); // => ['0', '1', '2']
Object.getPrototypeOf('qwe') === String.prototype; // => true
```
#### ECMAScript 6: Array
Modules `es6.array.from`, `es6.array.of`, `es6.array.copy-within`, `es6.array.fill`, `es6.array.find` and `es6.array.find-index`.
```javascript
Array
  .from(iterable | array-like, mapFn(val, index)?, that) -> array
  .of(...args) -> array
  #copyWithin(target = 0, start = 0, end = @length) -> @
  #fill(val, start = 0, end = @length) -> @
  #find(fn(val, index, @), that) -> val
  #findIndex(fn(val, index, @), that) -> index
  #@@unscopables -> object (cap)
```
[Example](http://goo.gl/nxmJTe):
```javascript
Array.from(new Set([1, 2, 3, 2, 1]));      // => [1, 2, 3]
Array.from({0: 1, 1: 2, 2: 3, length: 3}); // => [1, 2, 3]
Array.from('123', Number);                 // => [1, 2, 3]
Array.from('123', function(it){
  return it * it;
});                                        // => [1, 4, 9]

Array.of(1);       // => [1]
Array.of(1, 2, 3); // => [1, 2, 3]

function isOdd(val){
  return val % 2;
}
[4, 8, 15, 16, 23, 42].find(isOdd);      // => 15
[4, 8, 15, 16, 23, 42].findIndex(isOdd); // => 2
[4, 8, 15, 16, 23, 42].find(isNaN);      // => undefined
[4, 8, 15, 16, 23, 42].findIndex(isNaN); // => -1

Array(5).fill(42); // => [42, 42, 42, 42, 42]

[1, 2, 3, 4, 5].copyWithin(0, 3); // => [4, 5, 3, 4, 5]
```
#### ECMAScript 6: String & RegExp
Modules `es6.string.from-code-point`, `es6.string.raw`, `es6.string.code-point-at`, `es6.string.ends-with`, `es6.string.includes`, `es6.string.repeat`, `es6.string.starts-with` and `es6.regexp`.
```javascript
String
  .fromCodePoint(...codePoints) -> str
  .raw({raw}, ...substitutions) -> str
  #includes(str, from?) -> bool
  #startsWith(str, from?) -> bool
  #endsWith(str, from?) -> bool
  #repeat(num) -> str
  #codePointAt(pos) -> uint
[new] RegExp(pattern, flags?) -> regexp, ES6 fix: can alter flags (IE9+)
  #flags -> str (IE9+)
```
[Example](http://goo.gl/sdNGeJ):
```javascript
'foobarbaz'.includes('bar');      // => true
'foobarbaz'.includes('bar', 4);   // => false
'foobarbaz'.startsWith('foo');    // => true
'foobarbaz'.startsWith('bar', 3); // => true
'foobarbaz'.endsWith('baz');      // => true
'foobarbaz'.endsWith('bar', 6);   // => true

'string'.repeat(3); // => 'stringstringstring'

'𠮷'.codePointAt(0); // => 134071
String.fromCodePoint(97, 134071, 98); // => 'a𠮷b'

var name = 'Bob';
String.raw`Hi\n${name}!`;           // => 'Hi\\nBob!' (ES6 template string syntax)
String.raw({raw: 'test'}, 0, 1, 2); // => 't0e1s2t'

RegExp(/./g, 'm'); // => /./m

/foo/.flags;    // => ''
/foo/gim.flags; // => 'gim'
```
#### ECMAScript 6: Number & Math
Module `es6.number.constructor`. `Number` constructor support binary and octal literals, [example](http://goo.gl/jRd6b3):
```javascript
Number('0b1010101'); // => 85
Number('0o7654321'); // => 2054353
```
Modules `es6.number.statics` and `es6.math`.
```javascript
Number
  .EPSILON -> num
  .isFinite(num) -> bool
  .isInteger(num) -> bool
  .isNaN(num) -> bool
  .isSafeInteger(num) -> bool
  .MAX_SAFE_INTEGER -> int
  .MIN_SAFE_INTEGER -> int
  .parseFloat(str) -> num
  .parseInt(str) -> int
Math
  .acosh(num) -> num
  .asinh(num) -> num
  .atanh(num) -> num
  .cbrt(num) -> num
  .clz32(num) -> uint
  .cosh(num) -> num
  .expm1(num) -> num
  .fround(num) -> num
  .hypot(...args) -> num
  .imul(num, num) -> int
  .log1p(num) -> num
  .log10(num) -> num
  .log2(num) -> num
  .sign(num) -> 1 | -1 | 0 | -0 | NaN
  .sinh(num) -> num
  .tanh(num) -> num
  .trunc(num) -> num
```

### ECMAScript 6: Symbols
Module `es6.symbol`.
```javascript
Symbol(description?) -> symbol
  .hasInstance -> @@hasInstance
  .isConcatSpreadable -> @@isConcatSpreadable
  .iterator -> @@iterator
  .match -> @@match
  .replace -> @@replace
  .search -> @@search
  .species -> @@species
  .split -> @@split
  .toPrimitive -> @@toPrimitive
  .toStringTag -> @@toStringTag
  .unscopables -> @@unscopables
  .for(key) -> symbol
  .keyFor(symbol) -> key
  .useSimple() -> void
  .useSetter() -> void
Object
  .getOwnPropertySymbols(object) -> array
```
Also wrapped some `Object` methods for correct work with `Symbol` polyfill.

[Basic example](http://goo.gl/BbvWFc):
```javascript
var Person = (function(){
  var NAME = Symbol('name');
  function Person(name){
    this[NAME] = name;
  }
  Person.prototype.getName = function(){
    return this[NAME];
  };
  return Person;
})();

var person = new Person('Vasya');
log(person.getName());          // => 'Vasya'
log(person['name']);            // => undefined
log(person[Symbol('name')]);    // => undefined, symbols are uniq
for(var key in person)log(key); // => only 'getName', symbols are not enumerable
```
`Symbol.for` & `Symbol.keyFor` [example](http://goo.gl/0pdJjX):
```javascript
var symbol = Symbol.for('key');
symbol === Symbol.for('key'); // true
Symbol.keyFor(symbol);        // 'key'
```
[Example](http://goo.gl/mKVOQJ) with methods for getting own object keys:
```javascript
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;
Object.keys(O);                  // => ['a']
Object.getOwnPropertyNames(O);   // => ['a', 'b']
Object.getOwnPropertySymbols(O); // => [Symbol(c)]
Reflect.ownKeys(O);              // => ['a', 'b', Symbol(c)]
```
#### Caveats when using `Symbol` polyfill:

* We can't add new primitive type, `Symbol` returns object.
* By default, to hide the keys, `Symbol` polyfill defines setter in `Object.prototype`. For this reason, the `in` operator is not working correctly with `Symbol` polyfill: `Symbol() in {} // => true`.

You can disable defining setter in `Object.prototype`. [Example](http://goo.gl/N5UD7J):
```javascript
Symbol.useSimple();
var s1 = Symbol('s1')
  , o1 = {};
o1[s1] = true;
for(var key in o1)log(key); // => 'Symbol(s1)_t.qamkg9f3q', w/o native Symbol

Symbol.useSetter();
var s2 = Symbol('s2')
  , o2 = {};
o2[s2] = true;
for(var key in o2)log(key); // nothing
```
### ECMAScript 6: Collections
`core-js` uses native collections in most case, just fixes methods / constructor, if it's required, and in old environment uses fast polyfill (O(1) lookup).
#### Map
Module `es6.map`. About iterators from this module [here](#ecmascript-6-iterators).
```javascript
new Map(iterable (entries) ?) -> map
  #clear() -> void
  #delete(key) -> bool
  #forEach(fn(val, key, @), that) -> void
  #get(key) -> val
  #has(key) -> bool
  #set(key, val) -> @
  #size -> uint
```
[Example](http://goo.gl/RDbROF):
```javascript
var a = [1];

var map = new Map([['a', 1], [42, 2]]);
map.set(a, 3).set(true, 4);

log(map.size);        // => 4
log(map.has(a));      // => true
log(map.has([1]));    // => false
log(map.get(a));      // => 3
map.forEach(function(val, key){
  log(val);           // => 1, 2, 3, 4
  log(key);           // => 'a', 42, [1], true
});
map.delete(a);
log(map.size);        // => 3
log(map.get(a));      // => undefined
log(Array.from(map)); // => [['a', 1], [42, 2], [true, 4]]
```
#### Set
Module `es6.set`. About iterators from this module [here](#ecmascript-6-iterators).
```javascript
new Set(iterable?) -> set
  #add(key) -> @
  #clear() -> void
  #delete(key) -> bool
  #forEach(fn(el, el, @), that) -> void
  #has(key) -> bool
  #size -> uint
```
[Example](http://goo.gl/7XYya3):
```javascript
var set = new Set(['a', 'b', 'a', 'c']);
set.add('d').add('b').add('e');
log(set.size);        // => 5
log(set.has('b'));    // => true
set.forEach(function(it){
  log(it);            // => 'a', 'b', 'c', 'd', 'e'
});
set.delete('b');
log(set.size);        // => 4
log(set.has('b'));    // => false
log(Array.from(set)); // => ['a', 'c', 'd', 'e']
```
#### WeakMap
Module `es6.weak-map`.
```javascript
new WeakMap(iterable (entries) ?) -> weakmap
  #delete(key) -> bool
  #get(key) -> val
  #has(key) -> bool
  #set(key, val) -> @
```
[Example](http://goo.gl/SILXyw):
```javascript
var a = [1]
  , b = [2]
  , c = [3];

var wmap = new WeakMap([[a, 1], [b, 2]]);
wmap.set(c, 3).set(b, 4);
log(wmap.has(a));   // => true
log(wmap.has([1])); // => false
log(wmap.get(a));   // => 1
wmap.delete(a);
log(wmap.get(a));   // => undefined

// Private properties store:
var Person = (function(){
  var names = new WeakMap;
  function Person(name){
    names.set(this, name);
  }
  Person.prototype.getName = function(){
    return names.get(this);
  };
  return Person;
})();

var person = new Person('Vasya');
log(person.getName());          // => 'Vasya'
for(var key in person)log(key); // => only 'getName'
```
#### WeakSet
Module `es6.weak-set`.
```javascript
new WeakSet(iterable?) -> weakset
  #add(key) -> @
  #delete(key) -> bool
  #has(key) -> bool
```
[Example](http://goo.gl/TdFbEx):
```javascript
var a = [1]
  , b = [2]
  , c = [3];

var wset = new WeakSet([a, b, a]);
wset.add(c).add(b).add(c);
log(wset.has(b));   // => true
log(wset.has([2])); // => false
wset.delete(b);
log(wset.has(b));   // => false
```
#### Caveats when using collections polyfill:

* Frozen objects as collection keys are supported, but not recomended - it's slow (O(n) instead of O(1)) and, for weak-collections, leak.
* Weak-collections polyfill stores values as hidden properties of keys. It works correct and not leak in most cases. However, it is desirable to store a collection longer than its keys.

### ECMAScript 6: Iterators
Modules `es6.string.iterator` and `es6.array.iterator`:
```javascript
String
  #@@iterator() -> iterator
Array
  #values() -> iterator
  #keys() -> iterator
  #entries() -> iterator (entries)
  #@@iterator() -> iterator
Arguments
  #@@iterator() -> iterator (sham, available only in core-js methods)
```
Modules `es6.map` and `es6.set`:
```javascript
Map
  #values() -> iterator
  #keys() -> iterator
  #entries() -> iterator (entries)
  #@@iterator() -> iterator (entries)
Set
  #values() -> iterator
  #keys() -> iterator
  #entries() -> iterator (entries)
  #@@iterator() -> iterator
```
Module `web.dom.iterable`:
```javascript
NodeList
  #@@iterator() -> iterator
```
[Example](http://goo.gl/nzHVQF):
```javascript
var string = 'a𠮷b';

for(var val of string)log(val);         // => 'a', '𠮷', 'b'

var array = ['a', 'b', 'c'];

for(var val of array)log(val);          // => 'a', 'b', 'c'
for(var val of array.values())log(val); // => 'a', 'b', 'c'
for(var key of array.keys())log(key);   // => 0, 1, 2
for(var [key, val] of array.entries()){
  log(key);                             // => 0, 1, 2
  log(val);                             // => 'a', 'b', 'c'
}

var map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for(var [key, val] of map){
  log(key);                             // => 'a', 'b', 'c'
  log(val);                             // => 1, 2, 3
}
for(var val of map.values())log(val);   // => 1, 2, 3
for(var key of map.keys())log(key);     // => 'a', 'b', 'c'
for(var [key, val] of map.entries()){
  log(key);                             // => 'a', 'b', 'c'
  log(val);                             // => 1, 2, 3
}

var set = new Set([1, 2, 3, 2, 1]);

for(var val of set)log(val);            // => 1, 2, 3
for(var val of set.values())log(val);   // => 1, 2, 3
for(var key of set.keys())log(key);     // => 1, 2, 3
for(var [key, val] of set.entries()){
  log(key);                             // => 1, 2, 3
  log(val);                             // => 1, 2, 3
}

for(var x of document.querySelectorAll('*')){
  log(x.id);
}
```
Module `core.iter-helpers` - helpers for check iterable / get iterator in `library` version or, for example, for `arguments` object:
```javascript
core
  .isIterable(var) -> bool
  .getIterator(iterable) -> iterator
```
[Example](http://goo.gl/uFvXW6):
```js
var list = (function(){
  return arguments;
})(1, 2, 3);

log(core.isIterable(list)); // true;

var iter = core.getIterator(list);
log(iter.next().value); // 1
log(iter.next().value); // 2
log(iter.next().value); // 3
log(iter.next().value); // undefined
```
Module `core.$for` - iterators chaining - `for-of` and array / generator comprehensions helpers for ES5- syntax.
```javascript
$for(iterable, entries) -> iterator ($for)
  #of(fn(value, key?), that) -> void
  #array(mapFn(value, key?)?, that) -> array
  #filter(fn(value, key?), that) -> iterator ($for)
  #map(fn(value, key?), that) -> iterator ($for)
```
[Examples](http://goo.gl/Jtz0oG):
```javascript
$for(new Set([1, 2, 3, 2, 1])).of(function(it){
  log(it); // => 1, 2, 3
});

$for([1, 2, 3].entries(), true).of(function(key, value){
  log(key);   // => 0, 1, 2
  log(value); // => 1, 2, 3
});

$for('abc').of(console.log, console); // => 'a', 'b', 'c'

$for([1, 2, 3, 4, 5]).of(function(it){
  log(it); // => 1, 2, 3
  if(it == 3)return false;
});

var ar1 = $for([1, 2, 3]).array(function(v){
  return v * v;
}); // => [1, 4, 9]

var set = new Set([1, 2, 3, 2, 1]);
var ar1 = $for(set).filter(function(v){
  return v % 2;
}).array(function(v){
  return v * v;
}); // => [1, 9]

var iter = $for(set).filter(function(v){
  return v % 2;
}).map(function(v){
  return v * v;
});
iter.next(); // => {value: 1, done: false}
iter.next(); // => {value: 9, done: false}
iter.next(); // => {value: undefined, done: true}

var map1 = new Map([['a', 1], ['b', 2], ['c', 3]]);
var map2 = new Map($for(map1, true).filter(function(k, v){
  return v % 2;
}).map(function(k, v){
  return [k + k, v * v];
})); // => Map {aa: 1, cc: 9}
```

### ECMAScript 6: Promises
Module `es6.promise`.
```javascript
new Promise(executor(resolve(var), reject(var))) -> promise
  #then(resolved(var), rejected(var)) -> promise
  #catch(rejected(var)) -> promise
  .resolve(var || promise) -> promise
  .reject(var) -> promise
  .all(iterable) -> promise
  .race(iterable) -> promise
```
Basic [example](http://goo.gl/vGrtUC):
```javascript
function sleepRandom(time){
  return new Promise(function(resolve, reject){
    setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3);
  });
}

log('Run');                    // => Run
sleepRandom(5).then(function(result){
  log(result);                 // => 869, after 5 sec.
  return sleepRandom(10);
}).then(function(result){
  log(result);                 // => 202, after 10 sec.
}).then(function(){
  log('immediately after');    // => immediately after
  throw Error('Irror!');
}).then(function(){
  log('will not be displayed');
}).catch(log);                 // => => Error: Irror!
```
`Promise.resolve` and `Promise.reject` [example](http://goo.gl/vr8TN3):
```javascript
Promise.resolve(42).then(log); // => 42
Promise.reject(42).catch(log); // => 42

Promise.resolve($.getJSON('/data.json')); // => ES6 promise
```
`Promise.all` [example](http://goo.gl/RdoDBZ):
```javascript
Promise.all([
  'foo',
  sleepRandom(5),
  sleepRandom(15),
  sleepRandom(10)  // after 15 sec:
]).then(log);      // => ['foo', 956, 85, 382]
```
`Promise.race` [example](http://goo.gl/L8ovkJ):
```javascript
function timeLimit(promise, time){
  return Promise.race([promise, new Promise(function(resolve, reject){
    setTimeout(reject, time * 1e3, Error('Await > ' + time + ' sec'));
  })]);
}

timeLimit(sleepRandom(5), 10).then(log);   // => 853, after 5 sec.
timeLimit(sleepRandom(15), 10).catch(log); // Error: Await > 10 sec
```
ECMAScript 7 [async functions](https://github.com/lukehoban/ecmascript-asyncawait) [example](http://goo.gl/wnQS4j):
```javascript
var delay = time => new Promise(resolve => setTimeout(resolve, time))

async function sleepRandom(time){
  await delay(time * 1e3);
  return 0 | Math.random() * 1e3;
};
async function sleepError(time, msg){
  await delay(time * 1e3);
  throw Error(msg);
};

(async () => {
  try {
    log('Run');                // => Run
    log(await sleepRandom(5)); // => 936, after 5 sec.
    var [a, b, c] = await Promise.all([
      sleepRandom(5),
      sleepRandom(15),
      sleepRandom(10)
    ]);
    log(a, b, c);              // => 210 445 71, after 15 sec.
    await sleepError(5, 'Irror!');
    log('Will not be displayed');
  } catch(e){
    log(e);                    // => Error: 'Irror!', after 5 sec.
  }
})();
```
### ECMAScript 6: Reflect
Module `es6.reflect`.
```javascript
Reflect
  .apply(target, thisArgument, argumentsList) -> var
  .construct(target, argumentsList, newTarget?) -> object
  .defineProperty(target, propertyKey, attributes) -> bool
  .deleteProperty(target, propertyKey) -> bool
  .enumerate(target) -> iterator
  .get(target, propertyKey, receiver?) -> var
  .getOwnPropertyDescriptor(target, propertyKey) -> desc
  .getPrototypeOf(target) -> object | null
  .has(target, propertyKey) -> bool
  .isExtensible(target) -> bool
  .ownKeys(target) -> array
  .preventExtensions(target) -> bool
  .set(target, propertyKey, V, receiver?) -> bool
  .setPrototypeOf(target, proto) -> bool, sham(ie11+)
```
[Example](http://goo.gl/gVT0cH):
```javascript
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;
Reflect.ownKeys(O); // => ['a', 'b', Symbol(c)]

function C(a, b){
  this.c = a + b;
}

var instance = Reflect.construct(C, [20, 22]);
instance.c; // => 42
```
### ECMAScript 7
* `Array#includes` [proposal](https://github.com/domenic/Array.prototype.includes) - module `es7.array.includes`
* `String#at` [proposal](https://github.com/mathiasbynens/String.prototype.at) - module `es7.string.at`
* `String#lpad`, `String#rpad` [proposal](http://wiki.ecmascript.org/doku.php?id=strawman:string_padding) - modules `es7.string.lpad`, `es7.string.rpad`
* `Object.values`, `Object.entries` [tc39 discuss](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues) - module `es7.object.to-array`
* `Object.getOwnPropertyDescriptors` [proposal](https://gist.github.com/WebReflection/9353781) - module `es7.object.get-own-property-descriptors`
* `RegExp.escape` [proposal](https://gist.github.com/kangax/9698100) - module `es7.regexp.escape`
* `Map#toJSON`, `Set#toJSON` [proposal](https://github.com/DavidBruant/Map-Set.prototype.toJSON) - modules `es7.map.to-json`, `es7.set.to-json`

```javascript
Array
  #includes(var, from?) -> bool
String
  #at(index) -> string
  #lpad(length, fillStr = ' ') -> string
  #rpad(length, fillStr = ' ') -> string
Object
  .values(object) -> array
  .entries(object) -> array
  .getOwnPropertyDescriptors(object) -> object
RegExp
  .escape(str) -> str
Map
  #toJSON() -> array
Set
  #toJSON() -> array
```
[Examples](http://goo.gl/ZCaVZm):
```javascript
[1, 2, 3].includes(2);        // => true
[1, 2, 3].includes(4);        // => false
[1, 2, 3].includes(2, 2);     // => false

[NaN].indexOf(NaN);           // => -1
[NaN].includes(NaN);          // => true
Array(1).indexOf(undefined);  // => -1
Array(1).includes(undefined); // => true

'a𠮷b'.at(1);        // => '𠮷'
'a𠮷b'.at(1).length; // => 2

'hello'.lpad(10);         // => '     hello'
'hello'.lpad(10, '1234'); // => '41234hello'
'hello'.rpad(10);         // => 'hello     '
'hello'.rpad(10, '1234'); // => 'hello12341'

Object.values({a: 1, b: 2, c: 3});  // => [1, 2, 3]
Object.entries({a: 1, b: 2, c: 3}); // => [['a', 1], ['b', 2], ['c', 3]]

// Shallow object cloning with prototype and descriptors:
var copy = Object.create(Object.getPrototypeOf(O), Object.getOwnPropertyDescriptors(O));
// Mixin:
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

RegExp.escape('Hello -[]{}()*+?.,\\^$|'); // => 'Hello \-\[\]\{\}\(\)\*\+\?\.\,\\\^\$\|'

JSON.stringify(new Map([['a', 'b'], ['c', 'd']])); // => '[["a","b"],["c","d"]]'
JSON.stringify(new Set([1, 2, 3, 2, 1]));          // => '[1,2,3]'
```
### Mozilla JavaScript: Array generics
Module `js.array.statics`.
```javascript
Array
  .{...ArrayPrototype methods}
```

```javascript
Array.slice(arguments, 1);

Array.join('abcdef', '+'); // => 'a+b+c+d+e+f'

var form = document.getElementsByClassName('form__input');
Array.reduce(form, function(memo, it){
  memo[it.name] = it.value;
  return memo;
}, {}); // => {name: 'Vasya', age: '42', sex: 'yes, please'}
```
### setTimeout / setInterval
Module `web.timers`. Additional arguments fix for IE9-.
```javascript
setTimeout(fn(...args), time, ...args) -> id
setInterval(fn(...args), time, ...args) -> id
```
```javascript
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```
### setImmediate
Module `web.immediate`. [setImmediate](https://developer.mozilla.org/en-US/docs/Web/API/Window.setImmediate) polyfill.
```javascript
setImmediate(fn(...args), ...args) -> id
clearImmediate(id) -> void
```
[Example](http://goo.gl/6nXGrx):
```javascript
setImmediate(function(arg1, arg2){
  log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(function(){
  log('Message will not be displayed');
}));
```
### Console
Module `core.log`. Console cap for old browsers and some additional functionality. In IE, Node.js / IO.js and Firebug `console` methods not require call from `console` object, but in Chromium and V8 this throws error. For some reason, we can't replace `console` methods by their bound versions. Add `log` object with bound console methods. Some more sugar: `log` is shortcut for `log.log`, we can disable output.
```javascript
log ==== log.log
  .{...console API}
  .enable() -> void
  .disable() -> void
```
```javascript
// Before:
if(window.console && console.warn)console.warn(42);
// After:
log.warn(42);

// Before:
setTimeout(console.warn.bind(console, 42), 1000);
[1, 2, 3].forEach(console.warn, console);
// After:
setTimeout(log.warn, 1000, 42);
[1, 2, 3].forEach(log.warn);

// log is shortcut for log.log
setImmediate(log, 42); // => 42

log.disable();
log.warn('Console is disabled, you will not see this message.');
log.enable();
log.warn('Console is enabled again.');
```
### Object
Module `core.object`.
```javascript
Object
  .isObject(var) -> bool
  .classof(var) -> string 
  .define(target, mixin) -> target
  .make(proto | null, mixin?) -> object
```
Object classify [examples](http://goo.gl/YZQmGo):
```javascript
Object.isObject({});    // => true
Object.isObject(isNaN); // => true
Object.isObject(null);  // => false

var classof = Object.classof;

classof(null);                 // => 'Null'
classof(undefined);            // => 'Undefined'
classof(1);                    // => 'Number'
classof(true);                 // => 'Boolean'
classof('string');             // => 'String'
classof(Symbol());             // => 'Symbol'

classof(new Number(1));        // => 'Number'
classof(new Boolean(true));    // => 'Boolean'
classof(new String('string')); // => 'String'

var fn   = function(){}
  , list = (function(){return arguments})(1, 2, 3);

classof({});                   // => 'Object'
classof(fn);                   // => 'Function'
classof([]);                   // => 'Array'
classof(list);                 // => 'Arguments'
classof(/./);                  // => 'RegExp'
classof(new TypeError);        // => 'Error'

classof(new Set);              // => 'Set'
classof(new Map);              // => 'Map'
classof(new WeakSet);          // => 'WeakSet'
classof(new WeakMap);          // => 'WeakMap'
classof(new Promise(fn));      // => 'Promise'

classof([].values());          // => 'Array Iterator'
classof(new Set().values());   // => 'Set Iterator'
classof(new Map().values());   // => 'Map Iterator'

classof(Math);                 // => 'Math'
classof(JSON);                 // => 'JSON'

function Example(){}
Example.prototype[Symbol.toStringTag] = 'Example';

classof(new Example);          // => 'Example'
```
`Object.define` and `Object.make` [examples](http://goo.gl/rtpD5Z):
```javascript
// Before:
Object.defineProperty(target, 'c', {
  enumerable: true,
  configurable: true,
  get: function(){
    return this.a + this.b;
  }
});

// After:
Object.define(target, {
  get c(){
    return this.a + this.b;
  }
});

// Shallow object cloning with prototype and descriptors:
var copy = Object.make(Object.getPrototypeOf(src), src);

// Simple inheritance:
function Vector2D(x, y){
  this.x = x;
  this.y = y;
}
Object.define(Vector2D.prototype, {
  get xy(){
    return Math.hypot(this.x, this.y);
  }
});
function Vector3D(x, y, z){
  Vector2D.apply(this, arguments);
  this.z = z;
}
Vector3D.prototype = Object.make(Vector2D.prototype, {
  constructor: Vector3D,
  get xyz(){
    return Math.hypot(this.x, this.y, this.z);
  }
});

var vector = new Vector3D(9, 12, 20);
log(vector.xy);  // => 15
log(vector.xyz); // => 25
vector.y++;
log(vector.xy);  // => 15.811388300841896
log(vector.xyz); // => 25.495097567963924
```
### Dict
Module `core.dict`. Based on [TC39 discuss](https://github.com/rwaldron/tc39-notes/blob/master/es6/2012-11/nov-29.md#collection-apis-review) / [strawman](http://wiki.ecmascript.org/doku.php?id=harmony:modules_standard#dictionaries).
```javascript
[new] Dict(iterable (entries) | object ?) -> dict
  .isDict(var) -> bool
  .values(object) -> iterator
  .keys(object) -> iterator
  .entries(object) -> iterator (entries)
  .has(object, key) -> bool
  .get(object, key) -> val
  .set(object, key, value) -> object
  .forEach(object, fn(val, key, @), that) -> void
  .map(object, fn(val, key, @), that) -> new @
  .mapPairs(object, fn(val, key, @), that) -> new @
  .filter(object, fn(val, key, @), that) -> new @
  .some(object, fn(val, key, @), that) -> bool
  .every(object, fn(val, key, @), that) -> bool
  .find(object, fn(val, key, @), that) -> val
  .findKey(object, fn(val, key, @), that) -> key
  .keyOf(object, var) -> key
  .includes(object, var) -> bool
  .reduce(object, fn(memo, val, key, @), memo?) -> var
  .turn(object, fn(memo, val, key, @), memo = new @) -> memo
```
`Dict` create object without prototype from iterable or simple object. [Example](http://goo.gl/pnp8Vr):
```javascript
var map = new Map([['a', 1], ['b', 2], ['c', 3]]);

Dict();                    // => {__proto__: null}
Dict({a: 1, b: 2, c: 3});  // => {__proto__: null, a: 1, b: 2, c: 3}
Dict(map);                 // => {__proto__: null, a: 1, b: 2, c: 3}
Dict([1, 2, 3].entries()); // => {__proto__: null, 0: 1, 1: 2, 2: 3}

var dict = Dict({a: 42});
dict instanceof Object;   // => false
dict.a;                   // => 42
dict.toString;            // => undefined
'a' in dict;              // => true
'hasOwnProperty' in dict; // => false

Dict.isDict({});     // => false
Dict.isDict(Dict()); // => true
```
`Dict.keys`, `Dict.values` and `Dict.entries` returns iterators for objects, [examples](http://goo.gl/4u8UDK):
```javascript
var dict = {a: 1, b: 2, c: 3};

for(var key of Dict.keys(dict))log(key); // => 'a', 'b', 'c'

for(var val of Dict.values(dict))log(val); // => 1, 2, 3

for(var [key, val] of Dict.entries(dict)){
  log(key); // => 'a', 'b', 'c'
  log(val); // => 1, 2, 3
}

new Map(Dict.entries(dict)); // => Map {a: 1, b: 2, c: 3}

new Map((for([k, v] of Dict.entries(dict))if(v % 2)[k + k, v * v])); // =>  Map {aa: 1, cc: 9}
```
Basic dict operations for objects with prototype [example](http://goo.gl/B28UnG):
```js
'q' in {q: 1};            // => true
'toString' in {};         // => true

Dict.has({q: 1}, 'q');    // => true
Dict.has({}, 'toString'); // => false

({q: 1})['q'];            // => 1
({}).toString;            // => function toString(){ [native code] }

Dict.get({q: 1}, 'q');    // => 1
Dict.get({}, 'toString'); // => undefined

var O = {};
O['q'] = 1;
O['q'];         // => 1
O['__proto__'] = {w: 2};
O['__proto__']; // => {w: 2}
O['w'];         // => 2

var O = {};
Dict.set(O, 'q', 1);
O['q'];         // => 1
Dict.set(O, '__proto__', {w: 2});
O['__proto__']; // => {w: 2}
O['w'];         // => undefined
```
Other methods of `Dict` module are static equialents of `Array.prototype` methods for dictionaries, [examples](http://goo.gl/yARYXR):
```javascript
var dict = {a: 1, b: 2, c: 3};

Dict.forEach(dict, console.log, console);
// => 1, 'a', {a: 1, b: 2, c: 3}
// => 2, 'b', {a: 1, b: 2, c: 3}
// => 3, 'c', {a: 1, b: 2, c: 3}

Dict.map(dict, function(it){
  return it * it;
}); // => {a: 1, b: 4, c: 9}

Dict.mapPairs(dict, function(val, key){
  if(key != 'b')return [key + key, val * val];
}); // => {aa: 1, cc: 9}

Dict.filter(dict, function(it){
  return it % 2;
}); // => {a: 1, c: 3}

Dict.some(dict, function(it){
  return it === 2;
}); // => true

Dict.every(dict, function(it){
  return it === 2;
}); // => false

Dict.find(dict, function(it){
  return it > 2;
}); // => 3
Dict.find(dict, function(it){
  return it > 4;
}); // => undefined

Dict.findKey(dict, function(it){
  return it > 2;
}); // => 'c'
Dict.findKey(dict, function(it){
  return it > 4;
}); // => undefined

Dict.keyOf(dict, 2);    // => 'b'
Dict.keyOf(dict, 4);    // => undefined

Dict.includes(dict, 2); // => true
Dict.includes(dict, 4); // => false

Dict.reduce(dict, function(memo, it){
  return memo + it;
});     // => 6
Dict.reduce(dict, function(memo, it){
  return memo + it;
}, ''); // => '123'

Dict.turn(dict, function(memo, it, key){
  memo[key + key] = it;
});     // => {aa: 1, bb: 2, cc: 3}
Dict.turn(dict, function(memo, it, key){
  it % 2 && memo.push(key + it);
}, []); // => ['a1', 'c3']
```
### Partial application
Module `core.function.part`.
```javascript
Function
  #part(...args | _) -> fn(...args)
```
`Function#part` partial apply function without `this` binding. Uses global variable `_` (`core._` for builds without global namespace pollution) as placeholder and not conflict with `Underscore` / `LoDash`. [Examples](http://goo.gl/p9ZJ8K):
```javascript
var fn1 = log.part(1, 2);
fn1(3, 4);    // => 1, 2, 3, 4

var fn2 = log.part(_, 2, _, 4);
fn2(1, 3);    // => 1, 2, 3, 4

var fn3 = log.part(1, _, _, 4);
fn3(2, 3);    // => 1, 2, 3, 4

fn2(1, 3, 5); // => 1, 2, 3, 4, 5
fn2(1);       // => 1, 2, undefined, 4
```
### Date formatting
Module `core.date`. Much more simple and compact (~60 lines with `en` & `ru` locales) than [Intl](https://github.com/andyearnshaw/Intl.js) or [Moment.js](http://momentjs.com/). Use them if you need extended work with `Date`.
```javascript
Date
  #format(str, key?) -> str
  #formatUTC(str, key?) -> str
core
  .addLocale(key, object) -> core
  .locale(key?) -> key
```
Token | Unit | Sample
------|----- | ------
s  | Seconds           | 0-59
ss | Seconds, 2 digits | 00-59
m  | Minutes           | 0-59
mm | Minutes, 2 digits | 00-59
h  | Hours             | 0-23
hh | Hours, 2 digits   | 00-23
D  | Date              | 1-31
DD | Date, 2 digits    | 01-31
W  | Weekday, string   | Вторник
N  | Month             | 1-12
NN | Month, 2 digits   | 01-12
M  | Month, string     | Ноябрь
MM | Of month, string  | Ноября
Y  | Year, full        | 2014
YY | Year, 2 digits    | 14
[Examples](http://goo.gl/nkCJ15):
```javascript
new Date().format('W, MM D, YY, h:mm:ss');        // => 'Friday, November 28, 14, 18:47:05'
new Date().formatUTC('W, MM D, YY, h:mm:ss');     // => 'Friday, November 28, 14, 12:47:05'

new Date().format('W, D MM Y г., h:mm:ss', 'ru'); // => 'Пятница, 28 Ноября 2014 г., 18:07:25'

core.locale('ru');
new Date().format('W, D MM Y г., h:mm:ss');       // => 'Пятница, 28 Ноября 2014 г., 18:07:25'

new Date().format('DD.NN.YY');         // => '28.11.14'
new Date().format('hh:mm:ss');         // => '18:47:05'
new Date().format('DD.NN.Y hh:mm:ss'); // => '28.11.2014 18:47:05'
new Date().format('W, D MM Y года');   // => 'Пятница, 28 Ноября 2014 года'
new Date().format('D MM, h:mm');       // => '28 Ноября, 16:47'
new Date().format('M Y');              // => 'Ноябрь 2014'

(typeof core != 'undefined' ? core : require('core-js/library')).addLocale('ru', {
  weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
  months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
});
```
### Array
Module `core.array.turn`.
```javascript
Array
  #turn(fn(memo, val, index, @), memo = []) -> memo
```
Method `Array#turn` reduce array to object, [example](http://goo.gl/zZbvq7):
```javascript
[1, 2, 3, 4, 5].turn(function(memo, it){
  memo['key' + it] = !!(it % 2);
}, {}); // => {key1: true, key2: false, key3: true, key4: false, key5: true}

[1, 2, 3, 4, 5, 6, 7, 8, 9].turn(function(memo, it){
  it % 2 && memo.push(it * it);
  if(memo.length == 3)return false;
}); // => [1, 9, 25]
```
### Number
Modules `core.number.iterator` and `core.number.math`.
```javascript
Number
  #@@iterator() -> iterator
  #random(lim = 0) -> num
  #{...Math} 
```
Number Iterator [examples](http://goo.gl/RI60Ot):
```javascript
for(var i of 3)log(i); // => 0, 1, 2

Array.from(10, Math.random); // => [0.9817775336559862, 0.02720663254149258, ...]

Array.from(10); // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

Array.from(10, function(it){
  return this + it * it;
}, .42); // => [0.42, 1.42, 4.42, 9.42, 16.42, 25.42, 36.42, 49.42, 64.42, 81.42]

// Comprehensions:
[for(i of 10)if(i % 2)i * i]; // => [1, 9, 25, 49, 81]

Dict((for(i of 3)['key' + i, !(i % 2)])); // => {key0: true, key1: false, key2: true}
```
`Math` methods in `Number.prototype` [examples](http://goo.gl/06bs1k):
```javascript
3..pow(3);           // => 27
(-729).abs().sqrt(); // => 27

10..random(20);         // => Random number (10, 20), for example, 16.818793776910752
10..random(20).floor(); // => Random integer [10, 19], for example, 16

var array = [1, 2, 3, 4, 5];
array[array.length.random().floor()]; // => Random element, for example, 4
```
### Escaping characters
Module `core.string.escape-html`.
```javascript
String
  #escapeHTML() -> str
  #unescapeHTML() -> str
```
[Examples](http://goo.gl/6bOvsQ):
```javascript
'<script>doSomething();</script>'.escapeHTML(); // => '&lt;script&gt;doSomething();&lt;/script&gt;'
'&lt;script&gt;doSomething();&lt;/script&gt;'.unescapeHTML(); // => '<script>doSomething();</script>'
```
### delay
Module `core.delay`. [Promise](#ecmascript-6-promises)-returning delay function, [esdiscuss](https://esdiscuss.org/topic/promise-returning-delay-function). [Example](http://goo.gl/lbucba):
```javascript
delay(1e3).then(() => log('after 1 sec'));

(async () => {
  await delay(3e3);
  log('after 3 sec');
  
  while(await delay(3e3))log('each 3 sec');
})();
```

## Changelog
##### 0.9.16 - 2015.06.11
  * more correct order resolving thenable in [`Promise`](#ecmascript-6-promises) polyfill
  * uses polyfill instead of [buggy V8 `Promise`](https://code.google.com/p/v8/issues/detail?id=4162)

##### 0.9.15 - 2015.06.09
  * [collections](#ecmascript-6-collections) from `library` version return wrapped native instances
  * fixed collections prototype methods in `library` version
  * optimized `Math.hypot`

##### 0.9.14 - 2015.06.04
  * updated [`Promise.resolve` behavior](https://esdiscuss.org/topic/fixing-promise-resolve)
  * added fallback for IE11 buggy `Object.getOwnPropertyNames` + iframe
  * some other fixes

##### 0.9.13 - 2015.05.25
  * added fallback for [`Symbol` polyfill](#ecmascript-6-symbols) for old Android
  * some other fixes

##### 0.9.12 - 2015.05.24
  * different instances `core-js` should use / recognize the same symbols
  * some fixes

##### 0.9.11 - 2015.05.18
  * simplified [custom build](#custom-build)
    * add custom build js api
    * added `grunt-cli` to `devDependencies` for `npm run grunt`
  * some fixes

##### 0.9.10 - 2015.05.16
  * wrapped `Function#toString` for correct work wrapped methods / constructors with methods similar to the [`lodash` `isNative`](https://github.com/lodash/lodash/issues/1197)
  * added proto versions of methods to export object in `default` version for consistency with `library` version

##### 0.9.9 - 2015.05.14
  * wrapped `Object#propertyIsEnumerable` for [`Symbol` polyfill](#ecmascript-6-symbols)
  * [added proto versions of methods to `library` for ES7 bind syntax](https://github.com/zloirock/core-js/issues/65)
  * some other fixes

##### 0.9.8 - 2015.05.12
  * fixed [`Math.hypot`](#ecmascript-6-number--math) with negative arguments
  * added `Object#toString.toString` as fallback for [`lodash` `isNative`](https://github.com/lodash/lodash/issues/1197)

##### 0.9.7 - 2015.05.07
  * added [support DOM collections](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Streamlining_cross-browser_behavior) to IE8- `Array#slice`

##### 0.9.6 - 2015.05.01
  * added [`String#lpad`, `String#rpad`](#ecmascript-7)

##### 0.9.5 - 2015.04.30
  * added cap for `Function#@@hasInstance`
  * some fixes and optimizations

##### 0.9.4 - 2015.04.27
  * fixed `RegExp` constructor

##### 0.9.3 - 2015.04.26
  * some fixes and optimizations

##### 0.9.2 - 2015.04.25
  * more correct [`Promise`](#ecmascript-6-promises) unhandled rejection tracking and resolving / rejection priority

##### 0.9.1 - 2015.04.25
  * fixed `__proto__`-based [`Promise`](#ecmascript-6-promises) subclassing in some environments

##### 0.9.0 - 2015.04.24
  * added correct [symbols](#ecmascript-6-symbols) descriptors
    * fixed behavior `Object.{assign, create, defineProperty, defineProperties, getOwnPropertyDescriptor, getOwnPropertyDescriptors}` with symbols
    * added [single entry points](#commonjs) for `Object.{create, defineProperty, defineProperties}`
  * added [`Map#toJSON`](#ecmascript-7)
  * removed non-standard methods `Object#[_]` and `Function#only` - they solves syntax problems, but now in compilers available arrows and ~~in near future will be available~~ [available](http://babeljs.io/blog/2015/05/14/function-bind/) [bind syntax](https://github.com/zenparsing/es-function-bind)
  * removed non-standard undocumented methods `Symbol.{pure, set}`
  * some fixes and internal changes

##### 0.8.4 - 2015.04.18
  * uses `webpack` instead of `browserify` for browser builds - more compression-friendly result

##### 0.8.3 - 2015.04.14
  * fixed `Array` statics with single entry points

##### 0.8.2 - 2015.04.13
  * [`Math.fround`](#ecmascript-6-number--math) now also works in IE9-
  * added [`Set#toJSON`](#ecmascript-7)
  * some optimizations and fixes

##### 0.8.1 - 2015.04.03
  * fixed `Symbol.keyFor`

##### 0.8.0 - 2015.04.02
  * changed [CommonJS API](#commonjs)
  * splitted and renamed some modules
  * added support ES3 environment (ES5 polyfill) to **all** default versions - size increases slightly (+ ~4kb w/o gzip), many issues disappear, if you don't need it - [simply include only required namespaces / features / modules](#commonjs)
  * removed [abstract references](https://github.com/zenparsing/es-abstract-refs) support - proposal has been superseded =\
  * [`$for.isIterable` -> `core.isIterable`, `$for.getIterator` -> `core.getIterator`](#ecmascript-6-iterators), temporary available in old namespace
  * fixed iterators support in v8 `Promise.all` and `Promise.race`
  * many other fixes

##### 0.7.2 - 2015.03.09
  * some fixes

##### 0.7.1 - 2015.03.07
  * some fixes

##### 0.7.0 - 2015.03.06
  * rewritten and splitted into [CommonJS modules](#commonjs)

##### 0.6.1 - 2015.02.24
  * fixed support [`Object.defineProperty`](#ecmascript-5) with accessors on DOM elements on IE8

##### 0.6.0 - 2015.02.23
  * added support safe closing iteration - calling `iterator.return` on abort iteration, if it exists
  * added basic support [`Promise`](#ecmascript-6-promises) unhandled rejection tracking in shim
  * added [`Object.getOwnPropertyDescriptors`](#ecmascript-7)
  * removed `console` cap - creates too many problems - you can use [`core.log`](#console) module as that
  * restructuring [namespaces](#custom-build)
  * some fixes

##### 0.5.4 - 2015.02.15
  * some fixes

##### 0.5.3 - 2015.02.14
  * added [support binary and octal literals](#ecmascript-6-number--math) to `Number` constructor
  * added [`Date#toISOString`](#ecmascript-5)

##### 0.5.2 - 2015.02.10
  * some fixes

##### 0.5.1 - 2015.02.09
  * some fixes

##### 0.5.0 - 2015.02.08
  * systematization of modules
  * splitted [`es6` module](#ecmascript-6)
  * splitted [`console` module](#console): `web.console` - only cap for missing methods, `core.log` - bound methods & additional features
  * added [`delay` method](#delay)
  * some fixes

##### 0.4.10 - 2015.01.28
  * [`Object.getOwnPropertySymbols`](#ecmascript-6-symbols) polyfill returns array of wrapped keys

##### 0.4.9 - 2015.01.27
  * FF20-24 fix

##### 0.4.8 - 2015.01.25
  * some [collections](#ecmascript-6-collections) fixes

##### 0.4.7 - 2015.01.25
  * added support frozen objects as [collections](#ecmascript-6-collections) keys

##### 0.4.6 - 2015.01.21
  * added [`Object.getOwnPropertySymbols`](#ecmascript-6-symbols)
  * added [`NodeList.prototype[@@iterator]`](#ecmascript-6-iterators)
  * added basic `@@species` logic - getter in native constructors
  * removed `Function#by`
  * some fixes

##### 0.4.5 - 2015.01.16
  * some fixes

##### 0.4.4 - 2015.01.11
  * enabled CSP support

##### 0.4.3 - 2015.01.10
  * added `Function` instances `name` property for IE9+

##### 0.4.2 - 2015.01.10
  * `Object` static methods accept primitives
  * `RegExp` constructor can alter flags (IE9+)
  * added `Array.prototype[Symbol.unscopables]`

##### 0.4.1 - 2015.01.05
  * some fixes

##### 0.4.0 - 2015.01.03
  * added [`es6.reflect`](#ecmascript-6-reflect) module:
    * added `Reflect.apply`
    * added `Reflect.construct`
    * added `Reflect.defineProperty`
    * added `Reflect.deleteProperty`
    * added `Reflect.enumerate`
    * added `Reflect.get`
    * added `Reflect.getOwnPropertyDescriptor`
    * added `Reflect.getPrototypeOf`
    * added `Reflect.has`
    * added `Reflect.isExtensible`
    * added `Reflect.preventExtensions`
    * added `Reflect.set`
    * added `Reflect.setPrototypeOf`
  * `core-js` methods now can use external `Symbol.iterator` polyfill
  * some fixes

##### 0.3.3 - 2014.12.28
  * [console cap](#console) excluded from node.js default builds

##### 0.3.2 - 2014.12.25
  * added cap for [ES5](#ecmascript-5) freeze-family methods
  * fixed `console` bug

##### 0.3.1 - 2014.12.23
  * some fixes

##### 0.3.0 - 2014.12.23
  * Optimize [`Map` & `Set`](#ecmascript-6-collections):
    * use entries chain on hash table
    * fast & correct iteration
    * iterators moved to [`es6`](#ecmascript-6) and [`es6.collections`](#ecmascript-6-collections) modules

##### 0.2.5 - 2014.12.20
  * `console` no longer shortcut for `console.log` (compatibility problems)
  * some fixes

##### 0.2.4 - 2014.12.17
  * better compliance of ES6
  * added [`Math.fround`](#ecmascript-6-number--math) (IE10+)
  * some fixes

##### 0.2.3 - 2014.12.15
  * [Symbols](#ecmascript-6-symbols):
    * added option to disable addition setter to `Object.prototype` for Symbol polyfill:
      * added `Symbol.useSimple`
      * added `Symbol.useSetter`
    * added cap for well-known Symbols:
      * added `Symbol.hasInstance`
      * added `Symbol.isConcatSpreadable`
      * added `Symbol.match`
      * added `Symbol.replace`
      * added `Symbol.search`
      * added `Symbol.species`
      * added `Symbol.split`
      * added `Symbol.toPrimitive`
      * added `Symbol.unscopables`

##### 0.2.2 - 2014.12.13
  * added [`RegExp#flags`](#ecmascript-6-string--regexp) ([December 2014 Draft Rev 29](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#december_6_2014_draft_rev_29))
  * added [`String.raw`](#ecmascript-6-string--regexp)

##### 0.2.1 - 2014.12.12
  * repair converting -0 to +0 in [native collections](#ecmascript-6-collections)

##### 0.2.0 - 2014.12.06
  * added [`es7.proposals`](#ecmascript-7) and [`es7.abstract-refs`](https://github.com/zenparsing/es-abstract-refs) modules
  * added [`String#at`](#ecmascript-7)
  * added real [`String Iterator`](#ecmascript-6-iterators), older versions used Array Iterator
  * added abstract references support:
    * added `Symbol.referenceGet`
    * added `Symbol.referenceSet`
    * added `Symbol.referenceDelete`
    * added `Function#@@referenceGet`
    * added `Map#@@referenceGet`
    * added `Map#@@referenceSet`
    * added `Map#@@referenceDelete`
    * added `WeakMap#@@referenceGet`
    * added `WeakMap#@@referenceSet`
    * added `WeakMap#@@referenceDelete`
    * added `Dict.{...methods}[@@referenceGet]`
  * removed deprecated `.contains` methods
  * some fixes

##### 0.1.5 - 2014.12.01
  * added [`Array#copyWithin`](#ecmascript-6-array)
  * added [`String#codePointAt`](#ecmascript-6-string--regexp)
  * added [`String.fromCodePoint`](#ecmascript-6-string--regexp)

##### 0.1.4 - 2014.11.27
  * added [`Dict.mapPairs`](#dict)

##### 0.1.3 - 2014.11.20
  * [TC39 November meeting](https://github.com/rwaldron/tc39-notes/tree/master/es6/2014-11):
    * [`.contains` -> `.includes`](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-11/nov-18.md#51--44-arrayprototypecontains-and-stringprototypecontains)
      * `String#contains` -> [`String#includes`](#ecmascript-6-string--regexp)
      * `Array#contains` -> [`Array#includes`](#ecmascript-7)
      * `Dict.contains` -> [`Dict.includes`](#dict)
    * [removed `WeakMap#clear`](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-11/nov-19.md#412-should-weakmapweakset-have-a-clear-method-markm)
    * [removed `WeakSet#clear`](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-11/nov-19.md#412-should-weakmapweakset-have-a-clear-method-markm)

##### 0.1.2 - 2014.11.19
  * `Map` & `Set` bug fix

##### 0.1.1 - 2014.11.18
  * public release