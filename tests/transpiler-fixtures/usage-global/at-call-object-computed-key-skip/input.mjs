// computed `[items]` with Symbol-typed binding is disjoint from string key `items` per ECMA-262,
// so `obj.items` reads `'hello'` -> emits `es.string.at` (not `es.array.at`).
// `Symbol()` call still triggers symbol constructor + description polyfills
const items = Symbol();
const obj = { items: 'hello', [items]: ['a', 'b'] };
obj.items.at(0);
