# `Math.sumPrecise`
[Specification](https://tc39.es/proposal-math-sum/)\
[Proposal repo](https://github.com/tc39/proposal-math-sum)

## Modules
[`es.math.sum-precise`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.sum-precise.js).

## Built-ins signatures
```ts
namespace Math {
  sumPrecise(items: Iterable<number>): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/math-sum
{ core-js, @core-js/pure }/es|stable|actual|full/math/sum-precise
```

## Examples
```js
1e20 + 0.1 + -1e20; // => 0
Math.sumPrecise([1e20, 0.1, -1e20]); // => 0.1
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/math-sum`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/math-sum.d.ts)
