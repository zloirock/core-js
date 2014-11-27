# Core.js
Alternative modular standard library for JavaScript. Includes polyfills for ECMAScript 5, ECMAScript 6: [Symbol](#ecmascript-6-symbols), [Map](#map), [Set](#set), [WeakMap](#weakmap), [WeakSet](#weakset), iterators, [Promise](#promise); [setImmediate](#setimmmediate), static array methods, [console cap](#console). Additional functionality: [Dict](#dict), extended partial application, extended object api, [Date formatting](#date-formate) and some other sugar.

[Example](http://goo.gl/mfHYm2):
```javascript
console.log(Array.from(new Set([1, 2, 3, 2, 1]))); // => [1, 2, 3]
console.log('*'.repeat(10));                       // => '**********'
Promise.resolve(32).then(console.log);             // => 32
setImmediate(console.log, 42);                     // => 42
```

[Without extension of the native objects](http://goo.gl/mfHYm2):
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
    - [Set](#set)
    - [Map](#map)
    - [WeakSet](#weakset)
    - [WeakMap](#weakmap)
  - [ECMAScript 6: Iterators](#ecmascript-6-iterators)
  - [ECMAScript 6: Promises](#ecmascript-6-promises)
  - [setImmediate / setTimeout / setInterval](#setimmediate-settimeout-setinterval)
- [Install](#install)

### ECMAScript 5

### ECMAScript 6

### ECMAScript 6: Symbols
[Example](http://goo.gl/EUsvAf):
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

### ECMAScript 6: Collections
Module: `es6_collections`, iterators for them define in [es6_iterators](#ecmascript-6-iterators).

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

### ECMAScript 6: Promises

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