---
category: feature
tag:
  - es-proposal
---

# [Object iteration](https://github.com/tc39/proposal-object-iteration)

::: warning
**This proposal has been withdrawn and will be removed from the next major Core-JS version.**
:::

## Modules

- [`esnext.object.iterate-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-keys.js)
- [`esnext.object.iterate-values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-values.js)
- [`esnext.object.iterate-entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-entries.js).

## Types

```ts
interface Object {
  iterateKeys(object: { [k: PropertyKey]: any }): Iterator<string>;
  iterateValues<T>(object: { [k: PropertyKey]: T }): Iterator<T>;
  iterateEntries<T>(object: { [k: PropertyKey]: T }): Iterator<[string, T]>;
}
```

## Entry points

```
core-js/proposals/object-iteration
core-js(-pure)/full/object/iterate-keys
core-js(-pure)/full/object/iterate-values
core-js(-pure)/full/object/iterate-entries
```

## Example

[_Example_](https://is.gd/Wnm2tD):

```js
const obj = { foo: "bar", baz: "blah" };

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
