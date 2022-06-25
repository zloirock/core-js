# [Object iteration](https://github.com/tc39/proposal-object-iteration)
**This proposal has been withdrawn and will be removed from the next major `core-js` version.**

Modules [`esnext.object.iterate-keys`](/packages/core-js/modules/esnext.object.iterate-keys.js), [`esnext.object.iterate-values`](/packages/core-js/modules/esnext.object.iterate-values.js), [`esnext.object.iterate-entries`](/packages/core-js/modules/esnext.object.iterate-entries.js).
```js
class Object {
  iterateKeys(object: any): Iterator<string>;
  iterateValues(object: any): Iterator<any>;
  iterateEntries(object: any): Iterator<[string, any]>;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js/proposals/object-iteration
core-js(-pure)/full/object/iterate-keys
core-js(-pure)/full/object/iterate-values
core-js(-pure)/full/object/iterate-entries
```
[*Example*](https://is.gd/Wnm2tD):
```js
const obj = { foo: 'bar', baz: 'blah' };

for (const [key, value] of Object.iterateEntries(obj)) {
  console.log(`${key} -> ${value}`);
}

for (const key of Object.iterateKeys(obj)) {
  console.log(key);
}

for (const value of Object.iterateValues(obj)) {
  console.log(value);
}
```