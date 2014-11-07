# Core.js
Alternative standard library for javascript. Includes polyfills for ECMAScript 5, ECMAScript 6: Set, Map, WeakSet, WeakMap, Promise, Symbol, iterators; setImmediate, static array methods, console cap. Additional functionality: Dict, extended partial application, extended object api, Date formatting and other sugar.
### Install
```
npm i core-js
```
### Usage
Browser:
```html
<script src='core.min.js'></script>
```
Node.js:
```javascript
require('core-js');
```
### API:
```livescript
signature                                                      from         def in module
-------------------------------------------------------------------------------------------
global -> object                                               node         global
Object
  .create(proto | null, descriptors?) -> object                es5          es5
  .getPrototypeOf(object) -> proto | null                      es5 sham     es5
  .setPrototypeOf(target, proto | null) -> target              es6 sham     es6
  .defineProperty(target, key, desc) -> target                 es5 sham     es5
  .defineProperties(target, descriptors) -> target             es5 sham     es5
  .getOwnPropertyNames(object) -> array                        es5 sham     es5
  .getOwnPropertyDescriptor(object, key) -> desc               es5          es5
  .keys(object) -> array                                       es5          es5
  .values(object) -> array                                     es7          dict
  .entries(object) -> array                                    es7          dict
  .assign(target, ...src) -> target                            es6          es6
  .is(a, b) -> bool                                            es6          es6
  .isObject(var) -> bool                                       core         object
  .classof(var) -> string                                      core         object
  .define(target, mixin) -> target                             core         object
  .make(proto | null, mixin?) -> object                        core         object
  ::toString()                                                 es6 fix      es6
  ::[_](key) -> boundFn                                        core         binding
Function
  ::bind(object, ...args | _) -> boundFn(...args)              es5          es5
  ::part(...args | _) -> fn(...args)                           core         binding
  ::by(object | _, ...args | _) -> boundFn(...args)            core         binding
  ::only(num, that /* = @ */) -> (fn | boundFn)(...args)       core         binding
Array
  .isArray(var) -> bool                                        es5          es5
  .from(iterable | array-like, fn(val, index)?, that) -> array es6          es6
  .of(...args) -> array                                        es6          es6
  .{...Array::}                                                js1.6        array_statics
  ::slice(start?, end?) -> array                               es5 fix      es5
  ::join(string = ',') -> string                               es5 fix      es5
  ::indexOf(var, from?) -> int                                 es5          es5
  ::lastIndexOf(var, from?) -> int                             es5          es5
  ::every(fn(val, index, @), that) -> bool                     es5          es5
  ::some(fn(val, index, @), that) -> bool                      es5          es5
  ::forEach(fn(val, index, @), that) -> void                   es5          es5
  ::map(fn(val, index, @), that) -> array                      es5          es5
  ::filter(fn(val, index, @), that) -> array                   es5          es5
  ::reduce(fn(memo, val, index, @), memo?) -> var              es5          es5
  ::reduceRight(fn(memo, val, index, @), memo?) -> var         es5          es5
  ::fill(var, start?, end?) -> @                               es5          es5
  ::find(fn(val, index, @), that) -> var                       es6          es6
  ::findIndex(fn(val, index, @), that) -> int                  es6          es6
  ::values() -> iterator                                       es6          es6_iterators
  ::keys() -> iterator                                         es6          es6_iterators
  ::entries() -> iterator (entries)                            es6          es6_iterators
  ::@@iterator() -> iterator                                   es6          es6_iterators
  ::contains(var, from?) -> bool                               es7          array
  ::turn(fn(memo, val, index, @), memo = []) -> memo           core         array
[new] Dict(itarable (entries) | object ?) -> dict              core         dict
  .isDict(var) -> bool                                         core         dict
  .values(object) -> iterator                                  core         dict
  .keys(object) -> iterator                                    core         dict
  .entries(object) -> iterator (entries)                       core         dict
  .has(object, key) -> bool                                    core         dict
  .get(object, key) -> val                                     core         dict
  .set(object, key, value) -> object                           core         dict
  .forEach(object, fn(val, key, @), that) -> void              core         dict
  .map(object, fn(val, key, @), that) -> new @                 core         dict
  .filter(object, fn(val, key, @), that) -> new @              core         dict
  .some(object, fn(val, key, @), that) -> bool                 core         dict
  .every(object, fn(val, key, @), that) -> bool                core         dict
  .find(object, fn(val, key, @), that) -> val                  core         dict
  .findKey(object, fn(val, key, @), that) -> key               core         dict
  .keyOf(object, var) -> key                                   core         dict
  .contains(object, var) -> bool                               core         dict
  .reduce(object, fn(memo, val, key, @), memo?) -> var         core         dict
  .turn(object, fn(memo, val, key, @), memo = new @) -> memo   core         dict
new Set(iterable?) -> set                                      es6          es6_collections
  ::add(key) -> @                                              es6          es6_collections
  ::clear() -> void                                            es6          es6_collections
  ::delete(key) -> bool                                        es6          es6_collections
  ::forEach(fn(el, el, @), that) -> void                       es6          es6_collections
  ::has(key) -> bool                                           es6          es6_collections
  ::size -> uint                                               es6          es6_collections
  ::values() -> iterator                                       es6          es6_iterators
  ::keys() -> iterator                                         es6          es6_iterators
  ::entries() -> iterator (entries)                            es6          es6_iterators
  ::@@iterator() -> iterator                                   es6          es6_iterators
new Map(iterable (entries) ?) -> map                           es6          es6_collections
  ::clear() -> void                                            es6          es6_collections
  ::delete(key) -> bool                                        es6          es6_collections
  ::forEach(fn(val, key, @), that) -> void                     es6          es6_collections
  ::get(key) -> val                                            es6          es6_collections
  ::has(key) -> bool                                           es6          es6_collections
  ::set(key, val) -> @                                         es6          es6_collections
  ::size -> uint                                               es6          es6_collections
  ::values() -> iterator                                       es6          es6_iterators
  ::keys() -> iterator                                         es6          es6_iterators
  ::entries() -> iterator (entries)                            es6          es6_iterators
  ::@@iterator() -> iterator (entries)                         es6          es6_iterators
new WeakSet(iterable?) -> weakset                              es6          es6_collections
  ::add(key) -> @                                              es6          es6_collections
  ::clear() -> void                                            es6          es6_collections
  ::delete(key) -> bool                                        es6          es6_collections
  ::has(key) -> bool                                           es6          es6_collections
new WeakMap(iterable (entries) ?) -> weakmap                   es6 sham     es6_collections
  ::clear() -> void                                            es6 sham     es6_collections
  ::delete(key) -> bool                                        es6          es6_collections
  ::get(key) -> val                                            es6          es6_collections
  ::has(key) -> bool                                           es6          es6_collections
  ::set(key, val) -> @                                         es6          es6_collections
String
  ::trim() -> str                                              es5          es5
  ::contains(str, from?) -> bool                               es6          es6
  ::startsWith(str, from?) -> bool                             es6          es6
  ::endsWith(str, from?) -> bool                               es6          es6
  ::repeat(num) -> str                                         es6          es6
  ::@@iterator() -> iterator                                   es6 sham     es6_iterators
  ::escapeHTML() -> str                                        core         string
  ::unescapeHTML() -> str                                      core         string
RegExp
  .escape(str) -> str                                          es7          regexp
Number
  .EPSILON -> num                                              es6          es6
  .isFinite(num) -> bool                                       es6          es6
  .isInteger(num) -> bool                                      es6          es6
  .isNaN(num) -> bool                                          es6          es6
  .isSafeInteger(num) -> bool                                  es6          es6
  .MAX_SAFE_INTEGER -> int                                     es6          es6
  .MIN_SAFE_INTEGER -> int                                     es6          es6
  .parseFloat(str) -> num                                      es6          es6
  .parseInt(str) -> int                                        es6          es6
  ::@@iterator() -> iterator                                   core         number
  ::times(fn(i)?, that) -> array                               core         number
  ::random(lim = 0) -> num                                     core         number
  ::{...Math}                                                  core         number
Math
  .acosh(num) -> num                                           es6          es6
  .asinh(num) -> num                                           es6          es6
  .atanh(num) -> num                                           es6          es6
  .cbrt(num) -> num                                            es6          es6
  .clz32(num) -> uint                                          es6          es6
  .cosh(num) -> num                                            es6          es6
  .expm1(num) -> num                                           es6          es6
  .hypot(...args) -> num                                       es6          es6
  .imul(num, num) -> int                                       es6          es6
  .log1p(num) -> num                                           es6          es6
  .log10(num) -> num                                           es6          es6
  .log2(num) -> num                                            es6          es6
  .sign(num) -> 1 | -1 | 0 | -0 | NaN                          es6          es6
  .sinh(num) -> num                                            es6          es6
  .tanh(num) -> num                                            es6          es6
  .trunc(num) -> num                                           es6          es6
Date
  .now() -> int                                                es5          es5
  ::format(str, key?) -> str                                   core         date
  ::formatUTC(str, key?) -> str                                core         date
Symbol(description?) -> symbol                                 es6 sham     es6_symbol
  .for(key) -> symbol                                          es6          es6_symbol
  .keyFor(symbol) -> key                                       es6          es6_symbol
  .iterator -> symbol                                          es6 sham     es6_symbol
  .toStringTag -> symbol                                       es6          es6_symbol
  .pure() -> symbol || string                                  core         es6_symbol
  .set(object, key, val) -> object                             core         es6_symbol
Reflect -> object                                              es6          es6_symbol
  .ownKeys(object) -> array                                    es6          es6_symbol
new Promise(executor(resolve(var), reject(var))) -> promise    es6          es6_promise
  ::then(resolved(var), rejected(var)) -> promise              es6          es6_promise
  ::catch(rejected(var)) -> promise                            es6          es6_promise
  .resolve(var || promise) -> promise                          es6          es6_promise
  .reject(var) -> promise                                      es6          es6_promise
  .all(iterable) -> promise                                    es6          es6_promise
  .race(iterable) -> promise                                   es6          es6_promise
setTimeout(fn(...args), time, ...args) -> id                   w3c / whatwg timers
setInterval(fn(...args), time, ...args) -> id                  w3c / whatwg timers
setImmediate(fn(...args), ...args) -> id                       w3c / whatwg immediate
clearImmediate(id) -> void                                     w3c / whatwg immediate
console(...args) -> void                                       core         console
  .{...console API}                                            console api  console
  .enable() -> void                                            core         console
  .disable() -> void                                           core         console
[new] $for(iterable, entries) -> iterator ($for)               core         $for
  ::of(fn(value, key?), that) -> void                          core         $for
  ::array(mapFn(value, key?)?, that) -> array                  core         $for
  ::filter(fn(value, key?), that) -> iterator ($for)           core         $for
  ::map(fn(value, key?), that) -> iterator ($for)              core         $for
  .isIterable(var) -> bool                                     core         $for
  .getIterator(iterable) -> iterator                           core         $for
core                                                           core         common
  .{...global}                                                 core         common
  .addLocale(key, object) -> @                                 core         date
  .locale(key?) -> key                                         core         date
  .noConflict() -> core                                        core         common
_ -> object                                                    core / _     common
```