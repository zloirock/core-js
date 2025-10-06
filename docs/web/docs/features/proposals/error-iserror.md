# `Error.isError`
[Specification](https://tc39.es/proposal-is-error/)\
[Proposal repo](https://github.com/tc39/proposal-is-error)

## Built-ins signatures
```ts
class Error {
  static isError(value: any): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/is-error
```

> [!WARNING]
> We have no bulletproof way to polyfill this `Error.isError` / check if the object is an error, so it's an enough naive implementation.
