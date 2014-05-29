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
Object
  .create(object || null, descs = {}) -> object             es5
  .getPrototypeOf(object) -> object || null                 es5 sham
  .setPrototypeOf(object, proto) -> &0                      es6 sham
  .defineProperty(object, key, desc) -> &0                  es5 sham
  .defineProperties(object, descs) -> &0                    es5 sham
  .getOwnPropertyNames(object) -> array                     es5 sham
  .getOwnPropertyDescriptor(object, key) -> desc            es5
  .keys(object) -> array                                    es5
  .values(object) -> array                                  es7
  .entries(object) -> array                                 es7
  .assign(target, ...src) -> &0                             es6
  .is(a, b) -> bool                                         es6
  .isEnumerable(object, key) -> bool                        core
  .isPrototype(proto, object) -> bool                       core
  .getPropertyDescriptor(object, key) -> desc               core
  .getOwnPropertyDescriptors(object) -> descs               core
  .make(proto, props = {}) -> object                        core
  .define(object, props) -> &0                              core
  .isObject(var) -> bool                                    core
  .classof(var) -> string                                   core
  .symbol(description) -> string                            core
  .hidden(object, key, val) -> object                       core
  .tie(object, key, ...args) -> fn                          core
  ::[_](key, ...args) -> fn                                 core
Function
  .isNative(var) -> bool                                    core
  ::bind(object, ...args) -> fn                             es5
  ::part(...args) -> fn                                     core
  ::by(object, ...args) -> fn                               core
  ::methodize() -> fn                                       core
  ::timeout(time, ...args) -> deferred                      core
  ::interval(time, ...args) -> deferred                     core
  ::immediate(...args) -> deferred                          core
  ::construct(args) -> object                               core
Array
  .isArray(var) -> bool                                     es5
  .from(iterable || array-like, fn, that) -> array          es6
  .of(...args) -> array                                     es6
  .{...Array::}                                             js1.6
  ::slice(start = 0, end = @length) -> array                es5
  ::join(string = ',') -> string                            es5
  ::indexOf(var, from = 0) -> int                           es5
  ::lastIndexOf(var, from = -1) -> int                      es5
  ::every(fn, that) -> bool                                 es5
  ::some(fn, that) -> bool                                  es5
  ::forEach(fn, that) -> void                               es5
  ::map(fn, that) -> array                                  es5
  ::filter(fn, that) -> array                               es5
  ::reduce(fn, memo) -> var                                 es5
  ::reduceRight(fn, memo) -> var                            es5
  ::fill(var, start = 0, end = -1) -> @                     es5
  ::find(fn, that) -> var                                   es6
  ::findIndex(fn, that) -> int                              es6
  ::values() -> iterator                                    es6
  ::keys() -> iterator                                      es6
  ::entries() -> iterator (entries)                         es6
  ::@@iterator() -> iterator                                es6
  ::get(index) -> var                                       core
  ::set(index, value) -> @                                  core
  ::transform(fn, memo = []) -> memo                        core
  ::contains(var) -> bool                                   es7
Number
  .EPSILON -> num                                           es6
  .isFinite(num) -> bool                                    es6
  .isInteger(num) -> bool                                   es6
  .isNaN(num) -> bool                                       es6
  .isSafeInteger(num) -> bool                               es6
  .MAX_SAFE_INTEGER -> int                                  es6
  .MIN_SAFE_INTEGER -> int                                  es6
  .parseFloat(str) -> num                                   es6
  .parseInt(str) -> int                                     es6
  .toInteger(num) -> int                                    core
  ::times(fn, that) -> array                                core
  ::random(num = 0) -> num                                  core
  ::{...Math}                                               core
Math
  .acosh(num) -> num                                        es6
  .asinh(num) -> num                                        es6
  .atanh(num) -> num                                        es6
  .cbrt(num) -> num                                         es6
  .clz32(num) -> uint                                       es6
  .cosh(num) -> num                                         es6
  .expm1(num) -> num                                        es6
  .hypot(...args) -> num                                    es6
  .imul(num, num) -> int                                    es6
  .log1p(num) -> num                                        es6
  .log10(num) -> num                                        es6
  .log2(num) -> num                                         es6
  .sign(num) -> 1 || -1 || 0 || -0 || NaN                   es6
  .sinh(num) -> num                                         es6
  .tanh(num) -> num                                         es6
  .trunc(num) -> num                                        es6
  .randomInt(num, num = 0) -> int                           core
String
  ::trim() -> str                                           es5
  ::contains(str, from = 0) -> bool                         es6
  ::startsWith(str, from = 0) -> bool                       es6
  ::endsWith(str, from = @length) -> bool                   es6
  ::repeat(num) -> str                                      es6
  ::@@iterator() -> iterator                                es6 sham (fix later)
  ::escapeHTML() -> str                                     core
  ::unescapeHTML() -> str                                   core
Date
  .now() -> int                                             es5
  .addLocale(key, object) -> Date                           core
  .locale([key]) -> key                                     core
  ::format(str, key = Date.locale()) -> str                 core
  ::formatUTC(str, key = Date.locale()) -> str              core
RegExp
  .escape(str) -> str                                       es7
new Set([iterable]) -> set                                  es6
  ::add(key) -> @                                           es6
  ::clear() -> void                                         es6
  ::delete(key) -> bool                                     es6
  ::forEach(fn, that) -> void                               es6
  ::has(key) -> bool                                        es6
  ::size -> uint                                            es6
  ::values() -> iterator                                    es6
  ::keys() -> iterator                                      es6
  ::entries() -> iterator (entries)                         es6
  ::@@iterator() -> iterator                                es6
new Map([iterable]) -> map                                  es6
  ::clear() -> void                                         es6
  ::delete(key) -> bool                                     es6
  ::forEach(fn, that) -> void                               es6
  ::get(key) -> val                                         es6
  ::has(key) -> bool                                        es6
  ::set(key, val) -> @                                      es6
  ::size -> uint                                            es6
  ::values() -> iterator                                    es6
  ::keys() -> iterator                                      es6
  ::entries() -> iterator (entries)                         es6
  ::@@iterator() -> iterator (entries)                      es6
new WeakSet([iterable]) -> weakset                          es6
  ::add(key) -> @                                           es6
  ::clear() -> void                                         es6
  ::delete(key) -> bool                                     es6
  ::has(key) -> bool                                        es6
new WeakMap([iterable]) -> weakmap                          es6 sham
  ::clear() -> void                                         es6 sham
  ::delete(key) -> bool                                     es6
  ::get(key) -> val                                         es6
  ::has(key) -> bool                                        es6
  ::set(key, val) -> @                                      es6
new Promise(fn) -> promise                                  es6
  ::then(resolved, rejected) -> promise                     es6
  ::catch(rejected) -> promise                              es6
  .resolve(var || promise) -> promise                       es6
  .reject(var) -> promise                                   es6
  .all(iterable) -> promise                                 es6
  .race(iterable) -> promise                                es6
[new] Symbol([description]) -> symbol                       es6 sham
  .for(key) -> symbol                                       es6
  .keyFor(symbol) -> key                                    es6
  .iterator -> symbol                                       es6 sham
  .toStringTag -> symbol                                    es6
setTimeout(fn, time, ...args) -> uint                       w3c / whatwg
setInterval(fn, time, ...args) -> uint                      w3c / whatwg
setImmediate(fn, ...args) -> uint                           w3c / whatwg
clearImmediate(uint) -> void                                w3c / whatwg
console(...args) -> void                                    core
  .{...console API}                                         console api
  .enable() -> void                                         core
  .disable() -> void                                        core
global -> object                                            node
Dict([itarable (entries) || object]) -> dict                core
  .filter(object, fn, that) -> dict                         core
  .find(object, fn, that) -> val                            core
  .findKey(object, fn, that) -> key                         core
  .keyOf(object, var) -> key                                core
  .forEach(object, fn, that) -> void                        core
  .map(object, fn, that) -> dict                            core
  .reduce(object, fn, memo) -> var                          core
  .every(object, fn, that) -> bool                          core
  .some(object, fn, that) -> bool                           core
  .transform(object, fn, memo = Dict()) -> memo             core
  .has(object, key) -> bool                                 core
  .get(object, key) -> val                                  core
  .set(object, key, value) -> &0                            core
  .isDict(var) -> bool                                      core
  .values(object) -> iterator                               core
  .keys(object) -> iterator                                 core
  .entries(object) -> iterator (entries)                    core
C                                                           core
  .forOf(iterable, fn, that, entries) -> void               core
  .isIterable(var) -> bool                                  core
  .getIterator(iterable) -> iterator                        core
  .{...global}                                              core
_ -> object                                                 core / undescore / lodash
```