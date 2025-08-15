# Relative indexing method
[Specification](https://github.com/tc39/proposal-relative-indexing-method)

```ts
class Array {
  at(index: int): any;
}

class String {
  at(index: int): string;
}

class %TypedArray% {
  at(index: int): number;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```
core-js/proposals/relative-indexing-method
```
