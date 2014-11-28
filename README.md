# Core.js
Alternative modular standard library for JavaScript. Includes polyfills for [ECMAScript 5](#ecmascript-5), [ECMAScript 6](#ecmascript-6): [Symbol](#ecmascript-6-symbols), [Map](#map), [Set](#set), [WeakMap](#weakmap), [WeakSet](#weakset), [iterators](#ecmascript-6-iterators), [Promise](#ecmascript-6-promises); [setImmediate](#setimmediate), [array generics](#mozilla-javascript-array-generics), [console cap](#console). Additional functionality: [Dict](#dict), extended [partial application](#partial-application), [Date formatting](#date-formatting) and some other sugar.

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
  - [Mozilla JavaScript: Array generics](#mozilla-javascript-array-generics)
  - [setTimeout / setInterval](#settimeout--setinterval)
  - [setImmediate](#setimmediate)
  - [console](#console)
  - [Object classify](#object-classify)
  - [Dict](#dict)
  - [Partial application](#object-classify)
  - [Date formatting](#date-formatting)
  - [Array](#array)
  - [Escaping characters](#escaping-characters)
- [Install](#install)

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
#### ECMAScript 6 Object
```javascript
Object
  .assign(target, ...src) -> target
  .is(a, b) -> bool
  .setPrototypeOf(target, proto | null) -> target, sham(ie10+)
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
#### ECMAScript 6 Array
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
#### ECMAScript 6 String
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
#### ECMAScript 6 Number & Math
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
Reflect -> object
  .ownKeys(object) -> array
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
for(var key in person)console.log(key); // => only 'getName', symbols are not enumerable
```
`Symbol.for` & `Symbol.keyFor` [example](http://goo.gl/0pdJjX):
```javascript
var symbol = Symbol.for('key');
symbol === Symbol.for('key'); // true
Symbol.keyFor(symbol);        // 'key'
```
`Reflect.ownKeys` return all object keys - strings & symbols, [example](http://goo.gl/fyu6pn):
```javascript
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;
Reflect.ownKeys(O); // => ['a', 'b', Symbol(c)]
```

### ECMAScript 6: Collections
Module `es6_collections`, iterators for them are defined in [es6_iterators](#ecmascript-6-iterators).

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
Module `$for` - iterator chaining - `for-of` and array / generator comprehensions helpers for ES5.
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
Module `console`. Console cap for old browsers and some additional functionality.
```javascript
console(...args) -> void
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

console('Shortcut for console.log');
// Before:
setTimeout(console.log.bind(console, 42), 1000);
// After:
setTimeout(console, 1000, 42);
```
### Object classify
Module `object`.
```javascript
Object
  .isObject(var) -> bool
  .classof(var) -> string 
```
[Examples](http://goo.gl/YZQmGo):
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

### Dict
Module `dict`.
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
Object
  .values(object) -> array
  .entries(object) -> array
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

### Date formatting
Module `date`.
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
  #includes(var, from?) -> bool
  #turn(fn(memo, val, index, @), memo = []) -> memo
```
### Escaping characters
Module `string`.
```javascript
String
  #escapeHTML() -> str
  #unescapeHTML() -> str
```
```javascript
'<script>doSomething();</script>'.escapeHTML(); // => '&lt;script&gt;doSomething();&lt;/script&gt;'
'&lt;script&gt;doSomething();&lt;/script&gt;'.unescapeHTML(); // => '<script>doSomething();</script>'
```
Module `regexp`.
```javascript
RegExp
  .escape(str) -> str
```
```javascript
RegExp.escape('Hello -[]{}()*+?.,\\^$|'); // => 'Hello \-\[\]\{\}\(\)\*\+\?\.\,\\\^\$\|'
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