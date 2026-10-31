# New `Set` methods
[Specification](https://tc39.es/proposal-set-methods/)\
[Proposal repo](https://github.com/tc39/proposal-set-methods)

## Modules
[`es.set.difference`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.difference.js), [`es.set.intersection`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.intersection.js), [`es.set.is-disjoint-from`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.is-disjoint-from.js), [`es.set.is-subset-of`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.is-subset-of.js), [`es.set.is-superset-of`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.is-superset-of.js), [`es.set.symmetric-difference`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.symmetric-difference.js) and [`es.set.union`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.set.union.js).

## Built-ins signatures
```ts
class Set {
  difference(other: SetLike<mixed>): Set;
  intersection(other: SetLike<mixed>): Set;
  isDisjointFrom(other: SetLike<mixed>): boolean;
  isSubsetOf(other: SetLike<mixed>): boolean;
  isSupersetOf(other: SetLike<mixed>): boolean;
  symmetricDifference(other: SetLike<mixed>): Set;
  union(other: SetLike<mixed>): Set;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/set-methods
{ core-js, @core-js/pure }/es|stable|actual|full/set/difference
{ core-js, @core-js/pure }/es|stable|actual|full/set/intersection
{ core-js, @core-js/pure }/es|stable|actual|full/set/is-disjoint-from
{ core-js, @core-js/pure }/es|stable|actual|full/set/is-subset-of
{ core-js, @core-js/pure }/es|stable|actual|full/set/is-superset-of
{ core-js, @core-js/pure }/es|stable|actual|full/set/symmetric-difference
{ core-js, @core-js/pure }/es|stable|actual|full/set/union
```

## Examples
```js
new Set([1, 2, 3]).union(new Set([3, 4, 5]));               // => Set { 1, 2, 3, 4, 5 }
new Set([1, 2, 3]).intersection(new Set([3, 4, 5]));        // => Set { 3 }
new Set([1, 2, 3]).difference(new Set([3, 4, 5]));          // => Set { 1, 2 }
new Set([1, 2, 3]).symmetricDifference(new Set([3, 4, 5])); // => Set { 1, 2, 4, 5 }
new Set([1, 2, 3]).isDisjointFrom(new Set([4, 5, 6]));      // => true
new Set([1, 2, 3]).isSubsetOf(new Set([5, 4, 3, 2, 1]));    // => true
new Set([5, 4, 3, 2, 1]).isSupersetOf(new Set([1, 2, 3]));  // => true
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/set-methods`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/set-methods.d.ts)
