# `Error.isError`
[Specification](https://tc39.es/proposal-is-error/)\
[Proposal repo](https://github.com/tc39/proposal-is-error)

## Built-ins Signatures
```ts
class Error {
  static isError(value: any): boolean;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/is-error
```

> [!WARNING]
> We have no bulletproof way to polyfill this `Error.isError` / check if the object is an error, so it's an enough naive implementation.
