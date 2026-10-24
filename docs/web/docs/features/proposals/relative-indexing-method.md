# Relative indexing method
[Specification](https://tc39.es/proposal-relative-indexing-method/)\
[Proposal repo](https://github.com/tc39/proposal-relative-indexing-method)

## Modules
[`es.array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.at.js), [`es.string.at-alternative`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.at-alternative.js) and [`es.typed-array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.typed-array.at.js).

## Built-ins signatures
```ts
class Array {
  at(index: int): any;
}

class String {
  at(index: int): string | void;
}

class %TypedArray% {
  at(index: int): number | void;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/relative-indexing-method
{ core-js, @core-js/pure }/es|stable|actual|full/array(/virtual)/at
{ core-js, @core-js/pure }/es|stable|actual/string(/virtual)/at
core-js/es|stable|actual|full/typed-array/at
```

## Examples
```js
[1, 2, 3].at(1);  // => 2
[1, 2, 3].at(-1); // => 3

new Int32Array([1, 2, 3]).at(1);  // => 2
new Int32Array([1, 2, 3]).at(-1); // => 3

'abc'.at(1);  // => 'b'
'abc'.at(-1); // => 'c'
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/relative-indexing-method`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/relative-indexing-method.d.ts)
