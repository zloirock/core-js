# Relative indexing method
[Specification](https://tc39.es/proposal-relative-indexing-method/)\
[Proposal repo](https://github.com/tc39/proposal-relative-indexing-method)

## Built-ins signatures
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

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js/proposals/relative-indexing-method
```
