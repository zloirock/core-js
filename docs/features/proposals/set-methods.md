# [New `Set` methods](https://github.com/tc39/proposal-set-methods)
Modules [`esnext.set.difference`](/packages/core-js/modules/esnext.set.difference.js), [`esnext.set.intersection`](/packages/core-js/modules/esnext.set.intersection.js), [`esnext.set.is-disjoint-from`](/packages/core-js/modules/esnext.set.is-disjoint-from.js), [`esnext.set.is-subset-of`](/packages/core-js/modules/esnext.set.is-subset-of.js), [`esnext.set.is-superset-of`](/packages/core-js/modules/esnext.set.is-superset-of.js), [`esnext.set.symmetric-difference`](/packages/core-js/modules/esnext.set.symmetric-difference.js), [`esnext.set.union`](/packages/core-js/modules/esnext.set.union.js)
```ts
class Set {
  difference(iterable: Iterable<mixed>): Set;
  intersection(iterable: Iterable<mixed>): Set;
  isDisjointFrom(iterable: Iterable<mixed>): boolean;
  isSubsetOf(iterable: Iterable<mixed>): boolean;
  isSupersetOf(iterable: Iterable<mixed>): boolean;
  symmetricDifference(iterable: Iterable<mixed>): Set;
  union(iterable: Iterable<mixed>): Set;
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/set-methods
core-js(-pure)/full/set/difference
core-js(-pure)/full/set/intersection
core-js(-pure)/full/set/is-disjoint-from
core-js(-pure)/full/set/is-subset-of
core-js(-pure)/full/set/is-superset-of
core-js(-pure)/full/set/symmetric-difference
core-js(-pure)/full/set/union
```
[*Examples*](https://goo.gl/QMQdaJ):
```js
new Set([1, 2, 3]).union([3, 4, 5]);               // => Set {1, 2, 3, 4, 5}
new Set([1, 2, 3]).intersection([3, 4, 5]);        // => Set {3}
new Set([1, 2, 3]).difference([3, 4, 5]);          // => Set {1, 2}
new Set([1, 2, 3]).symmetricDifference([3, 4, 5]); // => Set {1, 2, 4, 5}

new Set([1, 2, 3]).isDisjointFrom([4, 5, 6]);      // => true
new Set([1, 2, 3]).isSubsetOf([5, 4, 3, 2, 1]);    // => true
new Set([5, 4, 3, 2, 1]).isSupersetOf([1, 2, 3]);  // => true
```
