# `Promise.withResolvers`
[Specification](https://tc39.es/proposal-promise-with-resolvers/)\
[Proposal repo](https://github.com/tc39/proposal-promise-with-resolvers)

## Signature
```ts
class Promise {
  static withResolvers(): { promise: Promise, resolve: function, reject: function };
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/promise-with-resolvers
```
