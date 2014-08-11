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
global -> object                                                      node
Object
  .create(proto | null, descs?) -> object                             es5
  .getPrototypeOf(object) -> proto | null                             es5 sham
  .setPrototypeOf(object, proto | null) -> &0                         es6 sham
  .defineProperty(object, key, desc) -> &0                            es5 sham
  .defineProperties(object, descs) -> &0                              es5 sham
  .getOwnPropertyNames(object) -> array                               es5 sham
  .getOwnPropertyDescriptor(object, key) -> desc                      es5
  .keys(object) -> array                                              es5
  .values(object) -> array                                            es7
  .entries(object) -> array                                           es7
  .assign(target, ...src) -> &0                                       es6
  .is(a, b) -> bool                                                   es6
  .isPrototype(proto, object) -> bool                                 core
  .getOwnPropertyKeys(object) -> array                                core
  .getPropertyDescriptor(object, key) -> desc                         core
  .getOwnPropertyDescriptors(object) -> descs                         core
  .make(proto | null, props?) -> object                               core
  .define(object, props) -> &0                                        core
  .isObject(var) -> bool                                              core
  .classof(var) -> string                                             core
  .tie(object, key, ...args | _) -> fn(...args)                       core
  ::[_](key, ...args | _) -> fn(...args)                              core
Function
  .isNative(var) -> bool                                              core
  ::bind(object, ...args | _) -> fn(...args)                          es5
  ::part(...args | _) -> fn(...args)                                  core
  ::by(object | _, ...args | _) -> fn(...args)                        core
  ::methodize() -> fn(that, ...args)                                  core
  ::invoke(args, that) -> var                                         core
  ::construct(args) -> object                                         core
  ::timeout(time, ...args) -> deferred                                core
  ::interval(time, ...args) -> deferred                               core
  ::immediate(...args) -> deferred                                    core
Array
  .isArray(var) -> bool                                               es5
  .from(iterable | array-like, fn(val, key, @)?, that) -> array       es6
  .of(...args) -> array                                               es6
  .{...Array::}                                                       js1.6
  ::slice(start?, end?) -> array                                      es5
  ::join(string = ',') -> string                                      es5
  ::indexOf(var, from?) -> int                                        es5
  ::lastIndexOf(var, from?) -> int                                    es5
  ::every(fn(val, key, @), that) -> bool                              es5
  ::some(fn(val, key, @), that) -> bool                               es5
  ::forEach(fn(val, key, @), that) -> void                            es5
  ::map(fn(val, key, @), that) -> array                               es5
  ::filter(fn(val, key, @), that) -> array                            es5
  ::reduce(fn(memo, val, key, @), memo?) -> var                       es5
  ::reduceRight(fn(memo, val, key, @), memo?) -> var                  es5
  ::fill(var, start?, end?) -> @                                      es5
  ::find(fn(val, key, @), that) -> var                                es6
  ::findIndex(fn(val, key, @), that) -> int                           es6
  ::values() -> iterator                                              es6
  ::keys() -> iterator                                                es6
  ::entries() -> iterator (entries)                                   es6
  ::@@iterator() -> iterator                                          es6
  ::get(index) -> var                                                 core
  ::set(index, value) -> @                                            core
  ::delete(index) -> bool                                             core
  ::contains(var) -> bool                                             es7
  ::clone() -> var                                                    core
  ::turn(fn(memo, val, key, @), memo = []) -> memo                    core
[new] Dict(itarable (entries) | object ?) -> dict                     core
  .isDict(var) -> bool                                                core
  .has(object, key) -> bool                                           core
  .get(object, key) -> val                                            core
  .set(object, key, value) -> &0                                      core
  .delete(object, key) -> bool                                        core
  .filter(object, fn(val, key, @), that) -> new @                     core
  .find(object, fn(val, key, @), that) -> val                         core
  .findKey(object, fn(val, key, @), that) -> key                      core
  .keyOf(object, var) -> key                                          core
  .forEach(object, fn(val, key, @), that) -> void                     core
  .map(object, fn(val, key, @), that) -> new @                        core
  .reduce(object, fn(memo, val, key, @), memo?) -> var                core
  .every(object, fn(val, key, @), that) -> bool                       core
  .some(object, fn(val, key, @), that) -> bool                        core
  .turn(object, fn(memo, val, key, @), memo = new @) -> memo          core
  .clone(foo) -> var                                                  core
  .values(object) -> iterator                                         core
  .keys(object) -> iterator                                           core
  .entries(object) -> iterator (entries)                              core
new Set(iterable?) -> set                                             es6
  ::add(key) -> @                                                     es6
  ::clear() -> void                                                   es6
  ::delete(key) -> bool                                               es6
  ::forEach(fn(el, el, @), that) -> void                              es6
  ::has(key) -> bool                                                  es6
  ::size -> uint                                                      es6
  ::values() -> iterator                                              es6
  ::keys() -> iterator                                                es6
  ::entries() -> iterator (entries)                                   es6
  ::@@iterator() -> iterator                                          es6
new Map(iterable (entries) ?) -> map                                  es6
  ::clear() -> void                                                   es6
  ::delete(key) -> bool                                               es6
  ::forEach(fn(val, key, @), that) -> void                            es6
  ::get(key) -> val                                                   es6
  ::has(key) -> bool                                                  es6
  ::set(key, val) -> @                                                es6
  ::size -> uint                                                      es6
  ::values() -> iterator                                              es6
  ::keys() -> iterator                                                es6
  ::entries() -> iterator (entries)                                   es6
  ::@@iterator() -> iterator (entries)                                es6
new WeakSet(iterable?) -> weakset                                     es6
  ::add(key) -> @                                                     es6
  ::clear() -> void                                                   es6
  ::delete(key) -> bool                                               es6
  ::has(key) -> bool                                                  es6
new WeakMap(iterable (entries) ?) -> weakmap                          es6 sham
  ::clear() -> void                                                   es6 sham
  ::delete(key) -> bool                                               es6
  ::get(key) -> val                                                   es6
  ::has(key) -> bool                                                  es6
  ::set(key, val) -> @                                                es6
String
  ::trim() -> str                                                     es5
  ::contains(str, from?) -> bool                                      es6
  ::startsWith(str, from?) -> bool                                    es6
  ::endsWith(str, from?) -> bool                                      es6
  ::repeat(num) -> str                                                es6
  ::@@iterator() -> iterator                                          es6 sham
  ::escapeHTML() -> str                                               core
  ::unescapeHTML() -> str                                             core
RegExp
  .escape(str) -> str                                                 es7
Number
  .EPSILON -> num                                                     es6
  .isFinite(num) -> bool                                              es6
  .isInteger(num) -> bool                                             es6
  .isNaN(num) -> bool                                                 es6
  .isSafeInteger(num) -> bool                                         es6
  .MAX_SAFE_INTEGER -> int                                            es6
  .MIN_SAFE_INTEGER -> int                                            es6
  .parseFloat(str) -> num                                             es6
  .parseInt(str) -> int                                               es6
  .toInteger(num) -> int                                              core
  ::times(fn(i, i, @), that) -> array                                 core
  ::random(num = 0) -> num                                            core
  ::{...Math}                                                         core
Math
  .acosh(num) -> num                                                  es6
  .asinh(num) -> num                                                  es6
  .atanh(num) -> num                                                  es6
  .cbrt(num) -> num                                                   es6
  .clz32(num) -> uint                                                 es6
  .cosh(num) -> num                                                   es6
  .expm1(num) -> num                                                  es6
  .hypot(...args) -> num                                              es6
  .imul(num, num) -> int                                              es6
  .log1p(num) -> num                                                  es6
  .log10(num) -> num                                                  es6
  .log2(num) -> num                                                   es6
  .sign(num) -> 1 | -1 | 0 | -0 | NaN                                 es6
  .sinh(num) -> num                                                   es6
  .tanh(num) -> num                                                   es6
  .trunc(num) -> num                                                  es6
  .randomInt(num, num = 0) -> int                                     core
Date
  .now() -> int                                                       es5
  .addLocale(key, object) -> Date                                     core
  .locale(key?) -> key                                                core
  ::format(str, key?) -> str                                          core
  ::formatUTC(str, key?) -> str                                       core
Symbol(description?) -> symbol                                        es6 sham
  .for(key) -> symbol                                                 es6
  .keyFor(symbol) -> key                                              es6
  .iterator -> symbol                                                 es6 sham
  .toStringTag -> symbol                                              es6
  .pure() -> symbol || string                                         core
  .set(object, key, val) -> &0                                       core
new Promise(resolver(resolve(var), reject(var))) -> promise           es6
  ::then(resolved(var), rejected(var)) -> promise                     es6
  ::catch(rejected(var)) -> promise                                   es6
  .resolve(var || promise) -> promise                                 es6
  .reject(var) -> promise                                             es6
  .all(iterable) -> promise                                           es6
  .race(iterable) -> promise                                          es6
setTimeout(fn(...args), time, ...args) -> uint                        w3c / whatwg
setInterval(fn(...args), time, ...args) -> uint                       w3c / whatwg
setImmediate(fn(...args), ...args) -> uint                            w3c / whatwg
clearImmediate(uint) -> void                                          w3c / whatwg
console(...args) -> void                                              core
  .{...console API}                                                   console api
  .enable() -> void                                                   core
  .disable() -> void                                                  core
$for(iterable, entries).of(fn(value, key?), that) -> void             core
  .isIterable(var) -> bool                                            core
  .getIterator(iterable) -> iterator                                  core
C                                                                     core
  .{...global}                                                        core
_ -> object                                                           core / undescore
```