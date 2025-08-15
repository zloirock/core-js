# `Iterator` sequencing
Specification: [proposal-iterator-sequencing](https://github.com/tc39/proposal-iterator-sequencing)

## Modules 
[`esnext.iterator.concat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.concat.js)

```ts
class Iterator {
  concat(...items: Array<IterableObject>): Iterator<any>;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/iterator-sequencing
core-js(-pure)/actual|full/iterator/concat
```

## Example
```js
Iterator.concat([0, 1].values(), [2, 3], function * () {
  yield 4;
  yield 5;
}()).toArray(); // => [0, 1, 2, 3, 4, 5]
```
