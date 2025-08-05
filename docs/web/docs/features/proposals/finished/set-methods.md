# [New `Set` methods](https://github.com/tc39/proposal-set-methods)
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

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```
core-js/proposals/set-methods-v2
```
