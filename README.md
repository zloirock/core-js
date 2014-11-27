# Core.js
Alternative modular standard library for JavaScript. Includes polyfills for [ECMAScript 5](#ecmascript-5), [ECMAScript 6](#ecmascript-6): [Symbol](#ecmascript-6-symbols), [Map](#map), [Set](#set), [WeakMap](#weakmap), [WeakSet](#weakset), [iterators](#ecmascript-6-iterators), [Promise](#ecmascript-6-promises); [setImmediate](#setimmediate), [array generics](#mozilla-javascript-array-generics), [console cap](#console). Additional functionality: [Dict](#dict), extended partial application, extended object api, [Date formatting](#date-formate) and some other sugar.

[Example](http://goo.gl/mfHYm2):
```javascript
console.log(Array.from(new Set([1, 2, 3, 2, 1]))); // => [1, 2, 3]
console.log('*'.repeat(10));                       // => '**********'
Promise.resolve(32).then(console.log);             // => 32
setImmediate(console.log, 42);                     // => 42
```

[Without extension of the native objects](http://goo.gl/WBhs43):
```javascript
var log  = core.console.log;
log(core.Array.from(new core.Set([1, 2, 3, 2, 1]))); // => [1, 2, 3]
log(core.String.repeat('*', 10));                    // => '**********'
core.Promise.resolve(32).then(log);                  // => 32
core.setImmediate(log, 42);                          // => 42
```
- [API](#api-)
  - [ECMAScript 5](#ecmascript-5)
  - [ECMAScript 6](#ecmascript-6)
  - [ECMAScript 6: Symbols](#ecmascript-6-symbols)
  - [ECMAScript 6: Collections](#ecmascript-6-collections)
    - [Map](#map)
    - [Set](#set)
    - [WeakMap](#weakmap)
    - [WeakSet](#weakset)
  - [ECMAScript 6: Iterators](#ecmascript-6-iterators)
  - [ECMAScript 6: Promises](#ecmascript-6-promises)
  - [Mozilla JavaScript: Array generics](#mozilla-javascript-array-generics)
  - [setTimeout / setInterval](#settimeout-setinterval)
  - [setImmediate](#setimmediate)
- [Install](#install)

## API:
### ECMAScript 5
Module `es5`, nothing new - without examples.
```javascript
Object
  .create(proto | null, descriptors?) -> object
  .getPrototypeOf(object) -> proto | null
  .setPrototypeOf(target, proto | null) -> target, sham(ie10+)
  .defineProperty(target, key, desc) -> target, cap for ie8-
  .defineProperties(target, descriptors) -> target, cap for ie8-
  .getOwnPropertyNames(object) -> array
  .getOwnPropertyDescriptor(object, key) -> desc
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
```

### ECMAScript 6
Module `es6`.
#### Object
```javascript
Object
  .assign(target, ...src) -> target
  .is(a, b) -> bool
  #toString() -> string, fix for @@toStringTag
```
[Example](http://goo.gl/IPehks):
```javascript
var foo = {q: 1, w: 2}
  , bar = {e: 3, r: 4}
  , baz = {t: 5, y: 6};
Object.assign(foo, bar, baz); // => foo = {q: 1, w: 2, e: 3, r: 4, t: 5, y: 6}

Object.is(NaN, NaN); // => true
Object.is(0, -0);    // => false
Object.is(42, 42);   // => true
Object.is(42, '42'); // => false
```
#### Array
```javascript
Array
  .from(iterable | array-like, fn(val, index)?, that) -> array
  .of(...args) -> array
  #fill(var, start?, end?) -> @
  #find(fn(val, index, @), that) -> var
  #findIndex(fn(val, index, @), that) -> int
```
[Example](http://goo.gl/gMYP1H):
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

Array(5).map(function(){
  return 42;
});                // => [undefined × 5], .map ignore holes
Array(5).fill(42); // => [42, 42, 42, 42, 42]
```
#### String
```javascript
String
  #includes(str, from?) -> bool
  #startsWith(str, from?) -> bool
  #endsWith(str, from?) -> bool
  #repeat(num) -> str
```
[String example](http://goo.gl/JKrMn5):
```javascript
'foobarbaz'.includes('bar');      // => true
'foobarbaz'.includes('bar', 4);   // => false
'foobarbaz'.startsWith('foo');    // => true
'foobarbaz'.startsWith('bar', 3); // => true
'foobarbaz'.endsWith('baz');      // => true
'foobarbaz'.endsWith('bar', 6);   // => true

'string'.repeat(3); // => 'stringstringstring'
```
#### Number & Math
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
Module `es6_symbol`.
```javascript
Symbol(description?) -> symbol
  .for(key) -> symbol
  .keyFor(symbol) -> key
  .iterator -> symbol
  .toStringTag -> symbol
  .pure() -> symbol || string
  .set(object, key, val) -> object
```
[Basic example](http://goo.gl/EUsvAf):
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
console.log(person.getName());          // => 'Vasya'
console.log(person['name']);            // => undefined
console.log(person[Symbol('name')]);    // => undefined, symbols are uniq
for(var key in person)console.log(key); // => only 'getName', symbols not enumerable
```
`Symbol.for` & `Symbol.keyFor` [example](http://goo.gl/0pdJjX):
```javascript
var symbol = Symbol.for('key');
symbol === Symbol.for('key'); // true
Symbol.keyFor(symbol);        // 'key'
```

### ECMAScript 6: Collections
Module `es6_collections`, iterators for them define in [es6_iterators](#ecmascript-6-iterators).

#### Map
```javascript
new Map(iterable (entries) ?) -> map
  #clear() -> void
  #delete(key) -> bool
  #forEach(fn(val, key, @), that) -> void
  #get(key) -> val
  #has(key) -> bool
  #set(key, val) -> @
  #size
```
[Example](http://goo.gl/RDbROF):
```javascript
var a = [1];

var map = new Map([['a', 1], [42, 2]]);
map.set(a, 3).set(true, 4);

console.log(map.size);        // => 4
console.log(map.has(a));      // => true
console.log(map.has([1]));    // => false
console.log(map.get(a));      // => 3
map.forEach(function(val, key){
  console.log(val);           // => 1, 2, 3, 4
  console.log(key);           // => 'a', 42, [1], true
});
map.delete(a);
console.log(map.size);        // => 3
console.log(map.get(a));      // => undefined
console.log(Array.from(map)); // => [['a', 1], [42, 2], [true, 4]]
```
#### Set
```javascript
new Set(iterable?) -> set
  #add(key) -> @
  #clear() -> void
  #delete(key) -> bool
  #forEach(fn(el, el, @), that) -> void
  #has(key) -> bool
  #size
```
[Example](http://goo.gl/7XYya3):
```javascript
var set = new Set(['a', 'b', 'a', 'c']);
set.add('d').add('b').add('e');
console.log(set.size);        // => 5
console.log(set.has('b'));    // => true
set.forEach(function(it){
  console.log(it);            // => 'a', 'b', 'c', 'd', 'e'
});
set.delete('b');
console.log(set.size);        // => 4
console.log(set.has('b'));    // => false
console.log(Array.from(set)); // => ['a', 'c', 'd', 'e']
```
#### WeakMap
```javascript
new WeakMap(iterable (entries) ?) -> weakmap
  #delete(key) -> bool
  #get(key) -> val
  #has(key) -> bool
  #set(key, val) -> @
```
[Example](http://goo.gl/wCvuq3):
```javascript
var a = [1]
  , b = [2]
  , c = [3];

var wmap = new WeakMap([[a, 1], [b, 2]]);
wmap.set(c, 3).set(b, 4);
console.log(wmap.has(a));   // => true
console.log(wmap.has([1])); // => false
console.log(wmap.get(a));   // => 1
wmap.delete(a);
console.log(wmap.get(a));   // => undefined

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
console.log(person.getName());          // => 'Vasya'
for(var key in person)console.log(key); // => only 'getName'
```
#### WeakSet
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
console.log(wset.has(b));   // => true
console.log(wset.has([2])); // => false
wset.delete(b);
console.log(wset.has(b));   // => false
```

### ECMAScript 6: Iterators
Module `es6_iterators`.
```javascript
String
  #@@iterator() -> iterator
Array
  #values() -> iterator
  #keys() -> iterator
  #entries() -> iterator (entries)
  #@@iterator() -> iterator
Set
  #values() -> iterator
  #keys() -> iterator
  #entries() -> iterator (entries)
  #@@iterator() -> iterator
Map
  #values() -> iterator
  #keys() -> iterator
  #entries() -> iterator (entries)
  #@@iterator() -> iterator (entries)
Arguments
  #@@iterator() -> iterator (sham)
```
[Example](http://goo.gl/ArArLq):
```javascript
var string = 'abc';

for(var val of string)console.log(val);         // => 'a', 'b', 'c'

var array = ['a', 'b', 'c'];

for(var val of array)console.log(val);          // => 'a', 'b', 'c'
for(var val of array.values())console.log(val); // => 'a', 'b', 'c'
for(var key of array.keys())console.log(key);   // => 0, 1, 2
for(var [key, val] of array.entries()){
  console.log(key);                             // => 0, 1, 2
  console.log(val);                             // => 'a', 'b', 'c'
}

var map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for(var [key, val] of map){
  console.log(key);                             // => 'a', 'b', 'c'
  console.log(val);                             // => 1, 2, 3
}
for(var val of map.values())console.log(val);   // => 1, 2, 3
for(var key of map.keys())console.log(key);     // => 'a', 'b', 'c'
for(var [key, val] of map.entries()){
  console.log(key);                             // => 'a', 'b', 'c'
  console.log(val);                             // => 1, 2, 3
}

var set = new Set([1, 2, 3, 2, 1]);

for(var val of set)console.log(val);            // => 1, 2, 3
for(var val of set.values())console.log(val);   // => 1, 2, 3
for(var key of set.keys())console.log(key);     // => 1, 2, 3
for(var [key, val] of set.entries()){
  console.log(key);                             // => 1, 2, 3
  console.log(val);                             // => 1, 2, 3
}
```

### ECMAScript 6: Promises
Module `es6_promise`.
```javascript
new Promise(executor(resolve(var), reject(var))) -> promise
  #then(resolved(var), rejected(var)) -> promise
  #catch(rejected(var)) -> promise
  .resolve(var || promise) -> promise
  .reject(var) -> promise
  .all(iterable) -> promise
  .race(iterable) -> promise
```
[Example](http://goo.gl/z3bXC8):
```javascript
var log = console.log.bind(console);
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
### Mozilla JavaScript: Array generics
Module `array_statics`.
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
Module `timers`. Additional arguments fix for IE9-.
```javascript
setTimeout(fn(...args), time, ...args) -> id
setInterval(fn(...args), time, ...args) -> id
```
### setImmediate
Module `immediate`. [setImmediate](https://developer.mozilla.org/en-US/docs/Web/API/Window.setImmediate) polyfill.
```javascript
setImmediate(fn(...args), ...args) -> id
clearImmediate(id) -> void
```
### Console
Module `console`. Console cap for old browsers. Binding console methods to console object. `console` is shortcut for `console.log`.
```
console(...args) -> void
  .{...console API}
  .enable() -> void
  .disable() -> void
```

## Install
```
// Node.js:
npm i core-js
// Bower:
bower install core.js
```
Browser builds: [default](https://github.com/zloirock/core-js/raw/master/client/core.min.js), [without extension of the native objects](https://github.com/zloirock/core-js/raw/master/client/core.min.js), [shim only](https://github.com/zloirock/core-js/raw/master/client/shim.min.js).

Custom builds:
```
npm i -g grunt-cli
npm i core-js
cd node_modules/core-js && npm i
grunt build:date,console,library --path=custom uglify
```
Require in Node.js
```javascript
// Dafault
require('core-js');
// Without extension of the native objects
var core = require('core-js/library');
// Shim only
require('core-js/shim');
```
Require in browser:
```html
<script src='core.min.js'></script>
```