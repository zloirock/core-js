# Core.js
Alternative modular compact (max. ~23kb w/o gzip) standard library for JavaScript. Includes polyfills for [ECMAScript 5](#ecmascript-5), [ECMAScript 6](#ecmascript-6): [symbols](#ecmascript-6-symbols), [collections](#ecmascript-6-collections), [iterators](#ecmascript-6-iterators), [promises](#ecmascript-6-promises); [setImmediate](#setimmediate), [array generics](#mozilla-javascript-array-generics), [console cap](#console). Some additional functionality such as [dictionaries](#dict), [extended partial application](#partial-application), [date formatting](#date-formatting).

[Example](http://goo.gl/mfHYm2):
```javascript
console.log(Array.from(new Set([1, 2, 3, 2, 1]))); // => [1, 2, 3]
console.log('*'.repeat(10));                       // => '**********'
Promise.resolve(32).then(console.log);             // => 32
setImmediate(console.log, 42);                     // => 42
```

[Without extension of native objects](http://goo.gl/WBhs43):
```javascript
var log  = core.console.log;
log(core.Array.from(new core.Set([1, 2, 3, 2, 1]))); // => [1, 2, 3]
log(core.String.repeat('*', 10));                    // => '**********'
core.Promise.resolve(32).then(log);                  // => 32
core.setImmediate(log, 42);                          // => 42
```
- [API](#api)
  - [ECMAScript 5](#ecmascript-5)
  - [ECMAScript 6](#ecmascript-6)
  - [ECMAScript 6: Symbols](#ecmascript-6-symbols)
  - [ECMAScript 6: Collections](#ecmascript-6-collections)
  - [ECMAScript 6: Iterators](#ecmascript-6-iterators)
  - [ECMAScript 6: Promises](#ecmascript-6-promises)
  - [ECMAScript 6: Reflect](#ecmascript-6-reflect)
  - [ECMAScript 7](#ecmascript-7)
  - [ECMAScript 7: Abstract References](#ecmascript-7-abstract-references)
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
- [Install](#install)
- [Changelog](#changelog)

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
```

### ECMAScript 6
Module `es6`. About iterators from this module [here](#ecmascript-6-iterators). [Symbols](#ecmascript-6-symbols), [collections](#ecmascript-6-collections) and [promises](#ecmascript-6-promises) in separate modules.
#### ECMAScript 6: Object
```javascript
Object
  .assign(target, ...src) -> target
  .is(a, b) -> bool
  .setPrototypeOf(target, proto | null) -> target, sham(ie11+)
  #toString() -> string, fix for @@toStringTag support
Function
  #name -> string (IE9+)
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
#### ECMAScript 6: Array
```javascript
Array
  .from(iterable | array-like, mapFn(val, index)?, that) -> array
  .of(...args) -> array
  #copyWithin(target = 0, start = 0, end = @length) -> @
  #fill(var, start = 0, end = @length) -> @
  #find(fn(val, index, @), that) -> var
  #findIndex(fn(val, index, @), that) -> int
  #@@unscopables -> object
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
```javascript
String
  .fromCodePoint(...codePoints) -> str
  .raw({raw}, ...substitutions) -> str
  #includes(str, from?) -> bool
  #startsWith(str, from?) -> bool
  #endsWith(str, from?) -> bool
  #repeat(num) -> str
  #codePointAt(pos) -> uint
RegExp
  #flags -> str (getter, IE9+)
```
[Example](http://goo.gl/gbP8Io):
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
String.raw`Hi\n${name}!`;           // => 'Hi\\nBob!'
String.raw({raw: 'test'}, 0, 1, 2); // => 't0e1s2t'

/foo/.flags;    // => ''
/foo/gim.flags; // => 'gim'
```
#### ECMAScript 6: Number & Math
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
  .fround(num) -> num (IE10+)
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
  .pure(description?) -> symbol || string
  .set(object, key, val) -> object
```
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
console.log(person.getName());          // => 'Vasya'
console.log(person['name']);            // => undefined
console.log(person[Symbol('name')]);    // => undefined, symbols are uniq
for(var key in person)console.log(key); // => only 'getName', symbols are not enumerable
```
`Symbol.for` & `Symbol.keyFor` [example](http://goo.gl/0pdJjX):
```javascript
var symbol = Symbol.for('key');
symbol === Symbol.for('key'); // true
Symbol.keyFor(symbol);        // 'key'
```
By default, `Symbol` polyfill define setter in `Object.prototype`. You can disable it. [Example](http://goo.gl/N5UD7J):
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
`Reflect.ownKeys` from [`Reflect`](#ecmascript-6-reflect) module returns all object keys - strings & symbols.
### ECMAScript 6: Collections
Module `es6_collections`. About iterators from this module [here](#ecmascript-6-iterators).

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
[Example](http://goo.gl/SILXyw):
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
Module `es6`:
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
Module `es6_collections`:
```javascript
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
```
[Example](http://goo.gl/3s27dC):
```javascript
var string = 'a𠮷b';

for(var val of string)console.log(val);         // => 'a', '𠮷', 'b'

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
Module `$for` - iterators chaining - `for-of` and array / generator comprehensions helpers for ES5- syntax.
```javascript
$for(iterable, entries) -> iterator ($for)
  #of(fn(value, key?), that) -> void
  #array(mapFn(value, key?)?, that) -> array
  #filter(fn(value, key?), that) -> iterator ($for)
  #map(fn(value, key?), that) -> iterator ($for)
  .isIterable(var) -> bool
  .getIterator(iterable) -> iterator
```
[Examples](http://goo.gl/Jtz0oG):
```javascript
$for(new Set([1, 2, 3, 2, 1])).of(function(it){
  console.log(it); // => 1, 2, 3
});

$for([1, 2, 3].entries(), true).of(function(key, value){
  console.log(key);   // => 0, 1, 2
  console.log(value); // => 1, 2, 3
});

$for('abc').of(console.log, console); // => 'a', 'b', 'c'

$for([1, 2, 3, 4, 5]).of(function(it){
  console.log(it); // => 1, 2, 3
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
Basic [example](http://goo.gl/vGrtUC):
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
Module `es6_reflect`.
```javascript
Reflect
  .apply(target, thisArgument, argumentsList) -> var
  .construct(target, argumentsList) -> object
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
console.log(Reflect.ownKeys(O)); // => ['a', 'b', Symbol(c)]

function C(a, b){
  this.c = a + b;
}

var instance = Reflect.construct(C, [20, 22]);
console.log(instance.c); // => 42
```
### ECMAScript 7
Module `es7`.
* `Array#includes` [proposal](https://github.com/domenic/Array.prototype.includes)
* `String#at` [proposal](https://github.com/mathiasbynens/String.prototype.at)
* `Object.values`, `Object.entries` [tc39 discuss](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues)
* `RegExp.escape` [proposal](https://gist.github.com/kangax/9698100)

```javascript
Array
  #includes(var, from?) -> bool
String
  #at(index) -> string
Object
  .values(object) -> array
  .entries(object) -> array
RegExp
  .escape(str) -> str
```
[Examples](http://goo.gl/4HcpLK):
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

Object.values({a: 1, b: 2, c: 3});  // => [1, 2, 3]
Object.entries({a: 1, b: 2, c: 3}); // => [['a', 1], ['b', 2], ['c', 3]]

RegExp.escape('Hello -[]{}()*+?.,\\^$|'); // => 'Hello \-\[\]\{\}\(\)\*\+\?\.\,\\\^\$\|'
```
### ECMAScript 7: Abstract References
Module `es7_refs`. Symbols and methods for [abstract references](https://github.com/zenparsing/es-abstract-refs). At the moment, they are supported only by several translators, such as [6to5](https://github.com/6to5/6to5).
```javascript
Symbol
  .referenceGet -> @@referenceGet
  .referenceSet -> @@referenceSet
  .referenceDelete -> @@referenceDelete
Function
  #@@referenceGet() -> @
Map
  #@@referenceGet ==== #get
  #@@referenceSet ==== #set
  #@@referenceDelete ==== #delete
WeakMap
  #@@referenceGet ==== #get
  #@@referenceSet ==== #set
  #@@referenceDelete ==== #delete
```
Private properties [example](http://goo.gl/sO0KHa) with [`WeakMaps`](#weakmap), class and basic abstract refs syntax:
```javascript
var Person = (NAME => class {
  constructor(name){
    this::NAME = name;
  }
  getName(){
    return this::NAME;
  }
})(new WeakMap);

var person = new Person('Vasya');
console.log(person.getName());          // => 'Vasya'
for(var key in person)console.log(key); // => only 'getName'
```
The same [example](http://goo.gl/3rVNTP) with the `private` keyword:
```javascript
class Person {
  private NAME
  constructor(name){
    this::NAME = name;
  }
  getName(){
    return this::NAME;
  }
}

var person = new Person('Vasya');
console.log(person.getName());          // => 'Vasya'
for(var key in person)console.log(key); // => only 'getName'
```
Virtual methods [example](http://goo.gl/GJmEfl):
```javascript
var {toString} = {};
[]::toString() // => '[object Array]'

function sum(){
  var {reduce} = [];
  return arguments::reduce((a, b)=> a + b);
}
sum(1, 2, 3, 4, 5) // => 15
```
Virtual `size` property for dictionaries [example](http://goo.gl/uAg4vC):
```javascript
let size = {
  [Symbol.referenceGet](it){
    return Object.keys(it).length;
  },
  [Symbol.referenceSet](it, length){
    for(let key of Object.keys(it).slice(length))delete it[key];
  }
}

{q: 1, w: 2, e: 3}::size // => 3
var dict = {q: 1, w: 2, e: 3};
dict::size = 2;
dict // => {q: 1, w: 2};
```
Methods from [Dict module](#dict) override `@@referenceGet` method, [example](http://goo.gl/H4S6d4):
```javascript
var {filter, map} = Dict;
var dict = {q: 1, w: 2, e: 3}
  ::filter((v, k) => k != 'w')
  ::map(v => v * v); // => {"q":1,"e":9}
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
```javascript
// Before:
setTimeout(log.bind(null, 42), 1000);
// After:
setTimeout(log, 1000, 42);
```
### setImmediate
Module `immediate`. [setImmediate](https://developer.mozilla.org/en-US/docs/Web/API/Window.setImmediate) polyfill.
```javascript
setImmediate(fn(...args), ...args) -> id
clearImmediate(id) -> void
```
[Example](http://goo.gl/6nXGrx):
```javascript
setImmediate(function(arg1, arg2){
  console.log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(function(){
  console.log('Message will not be displayed');
}));
```
### Console
Module `console`. Console cap for old browsers and some additional functionality.
```javascript
console
  .{...console API}
  .enable() -> void
  .disable() -> void
```
```javascript
// Before:
if(window.console && console.log)console.log(42);
// After:
console.log(42);

// Before:
setTimeout(console.log.bind(console, 42), 1000);
[1, 2, 3].forEach(console.log, console);
// After:
setTimeout(console.log, 1000, 42);
[1, 2, 3].forEach(console.log);

console.disable();
console.warn('Console is disabled, you will not see this message.');
console.enable();
console.warn('Console is enabled again.');
```
### Object
Module `object`.
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
console.log(vector.xy);  // => 15
console.log(vector.xyz); // => 25
vector.y++;
console.log(vector.xy);  // => 15.811388300841896
console.log(vector.xyz); // => 25.495097567963924
```
### Dict
Module `dict`. Based on [TC39 discuss](https://github.com/rwaldron/tc39-notes/blob/master/es6/2012-11/nov-29.md#collection-apis-review) / [strawman](http://wiki.ecmascript.org/doku.php?id=harmony:modules_standard#dictionaries).
```javascript
[new] Dict(itarable (entries) | object ?) -> dict
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
`Dict.keys`, `Dict.values` and `Dict.entries` return iterators for objects, [examples](http://goo.gl/JRkgM8):
```javascript
var dict = {a: 1, b: 2, c: 3};

for(var key of Dict.keys(dict))console.log(key); // => 'a', 'b', 'c'

for(var [key, val] of Dict.entries(dict)){
  console.log(key); // => 'a', 'b', 'c'
  console.log(val); // => 1, 2, 3
}

$for(Dict.values(dict)).of(console.log); // => 1, 2, 3

new Map(Dict.entries(dict)); // => Map {a: 1, b: 2, c: 3}

new Map((for([k, v] of Dict.entries(dict))if(v % 2)[k + k, v * v])); // =>  Map {aa: 1, cc: 9}
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
Module `binding`.
```javascript
Function
  #part(...args | _) -> fn(...args)
  #by(object | _, ...args | _) -> boundFn(...args)
  #only(num, that /* = @ */) -> (fn | boundFn)(...args)
Object
  #[_](key) -> boundFn
```
`Function#part` partial apply function without `this` binding. Uses global variable `_` (`core._` for builds without extension of native objects) as placeholder. [Examples](http://goo.gl/p9ZJ8K):
```javascript
var fn1 = console.log.part(1, 2);
fn1(3, 4);    // => 1, 2, 3, 4

var fn2 = console.log.part(_, 2, _, 4);
fn2(1, 3);    // => 1, 2, 3, 4

var fn3 = console.log.part(1, _, _, 4);
fn3(2, 3);    // => 1, 2, 3, 4

fn2(1, 3, 5); // => 1, 2, 3, 4, 5
fn2(1);       // => 1, 2, undefined, 4
```
Method `Function#by` is analogue of `Function#bind` with the ability to use placeholder:
```javascript
var fn = console.log.by(console, _, 2, _, 4);
fn(1, 3, 5); // => 1, 2, 3, 4, 5
```
Method `Object#[_]` extracts bound method from object, [examples](http://goo.gl/dQsSTi):
```javascript
['foobar', 'foobaz', 'barbaz'].filter(/bar/[_]('test')); // => ['foobar', 'barbaz']

var has = {}.hasOwnProperty[_]('call');

log(has({key: 42}, 'foo')); // => false
log(has({key: 42}, 'key')); // => true

var array = []
  , push  = array[_]('push');
push(1);
push(2, 3);
log(array); // => [1, 2, 3];
```
Method `Function#only` limits number of arguments. [Example](http://goo.gl/ROgBsL):
```javascript
[1, 2, 3].forEach(log.only(1)); // => 1, 2, 3
```
### Date formatting
Module `date`. Much more simple and compact (~60 lines with `en` & `ru` locales) than [Intl](https://github.com/andyearnshaw/Intl.js) or [Moment.js](http://momentjs.com/). Use them if you need extended work with `Date`.
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
Module `array`.
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
Module `number`.
```javascript
Number
  #@@iterator() -> iterator
  #random(lim = 0) -> num
  #{...Math} 
```
Number Iterator [examples](http://goo.gl/mkReUE):
```javascript
for(var i of 3)console.log(i); // => 0, 1, 2

$for(3).of(console.log); // => 0, 1, 2

Array.from(10, Math.random); // => [0.9817775336559862, 0.02720663254149258, ...]

Array.from(10); // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

Array.from(10, function(it){
  return this + it * it;
}, .42); // => [0.42, 1.42, 4.42, 9.42, 16.42, 25.42, 36.42, 49.42, 64.42, 81.42]

// Comprehensions:
[for(i of 10)if(i % 2)i * i]; // => [1, 9, 25, 49, 81]

Dict((for(i of 3)['key' + i, !(i % 2)])); // => {key0: true, key1: false, key2: true}

$for(10).filter(function(i){
  return i % 2;
}).array(function(i){
  return i * i;
});  // => [1, 9, 25, 49, 81]

Dict($for(3).map(function(i){
  return ['key' + i, !(i % 2)];
})); // => {key0: true, key1: false, key2: true}
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
Module `string`.
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

## Install
```
// Node.js:
npm i core-js
// Bower:
bower install core.js
```
Browser builds: [default](https://github.com/zloirock/core-js/raw/master/client/core.min.js), [without extension of native objects](https://github.com/zloirock/core-js/raw/master/client/core.min.js), [shim only](https://github.com/zloirock/core-js/raw/master/client/shim.min.js).

Custom builds:
```
npm i -g grunt-cli
npm i core-js
cd node_modules/core-js && npm i
grunt build:date,console,library --path=custom uglify
```
Where `date` and `console` are module names, `library` is flag for not extension of native objects and `custom` is target file name.

Require in Node.js:
```javascript
// Dafault
require('core-js');
// Without extension of native objects
var core = require('core-js/library');
// Shim only
require('core-js/shim');
```
## Changelog
**0.4.5** - *2015.01.16* - Some fixes

**0.4.4** - *2015.01.11* - Enabled CSP support

**0.4.3** - *2015.01.10* - Added `Function` instances `name` property for IE9+

**0.4.2** - *2015.01.10*
  * `Object` static methods accept primitives
  * `RegExp` constructor can alter flags (IE9+)
  * added `Array.prototype[Symbol.unscopables]`

**0.4.1** - *2015.01.05* - Some fixes

**0.4.0** - *2015.01.03*
  * added [`es6_reflect`](#ecmascript-6-reflect) module:
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
  * core.js methods now can use external `Symbol.iterator` polyfill
  * some fixes

**0.3.3** - *2014.12.28*
  * [console cap](#console) excluded from node.js default builds

**0.3.2** - *2014.12.25*
  * added cap for [ES5](#ecmascript-5) freeze-family methods
  * fixed `console` bug

**0.3.1** - *2014.12.23* - Some fixes

**0.3.0** - *2014.12.23* - Optimize [`Map` & `Set`](#ecmascript-6-collections)
  * use entries chain on hash table
  * fast & correct iteration
  * iterators moved to [`es6`](#ecmascript-6) and [`es6_collections`](#ecmascript-6-collections) modules

**0.2.5** - *2014.12.20*
  * `console` no longer shortcut for `console.log` (compatibility problems)
  * some fixes

**0.2.4** - *2014.12.17* - Better compliance of ES6
  * some fixes
  * added [`Math.fround`](#ecmascript-6-number--math) (IE10+)

**0.2.3** - *2014.12.15* - [Symbols](#ecmascript-6-symbols):
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

**0.2.2** - *2014.12.13* - ES6:
  * added [`RegExp#flags`](#ecmascript-6-string--regexp) ([December 2014 Draft Rev 29](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#december_6_2014_draft_rev_29))
  * added [`String.raw`](#ecmascript-6-string--regexp)

**0.2.1** - *2014.12.12* - Repair converting -0 to +0 in [native collections](#ecmascript-6-collections)

**0.2.0** - *2014.12.06*
  * added [`es7`](#ecmascript-7), [`es7_refs`](#ecmascript-7-abstract-references) modules
  * added [`String#at`](#ecmascript-7)
  * added real [String Iterator](#ecmascript-6-iterators), older versions used Array Iterator
  * added [abstract references](#ecmascript-7-abstract-references) support:
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

**0.1.5** - *2014.12.01* - ES6:
  * added [`Array#copyWithin`](#ecmascript-6-array)
  * added [`String#codePointAt`](#ecmascript-6-string--regexp)
  * added [`String.fromCodePoint`](#ecmascript-6-string--regexp)

**0.1.4** - *2014.11.27*
  * added [`Dict.mapPairs`](#dict)

**0.1.3** - *2014.11.20* - [TC39 November meeting](https://github.com/rwaldron/tc39-notes/tree/master/es6/2014-11):
  * [`.contains` -> `.includes`](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-11/nov-18.md#51--44-arrayprototypecontains-and-stringprototypecontains)
    * `String#contains` -> [`String#includes`](#ecmascript-6-string--regexp)
    * `Array#contains` -> [`Array#includes`](#ecmascript-7)
    * `Dict.contains` -> [`Dict.includes`](#dict)
  * [removed `WeakMap#clear`](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-11/nov-19.md#412-should-weakmapweakset-have-a-clear-method-markm)
  * [removed `WeakSet#clear`](https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-11/nov-19.md#412-should-weakmapweakset-have-a-clear-method-markm)

**0.1.2** - *2014.11.19* - Map & Set bug fix

**0.1.1** - *2014.11.18* - Public release