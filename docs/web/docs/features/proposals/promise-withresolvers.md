# `Promise.withResolvers`
[Specification](https://github.com/tc39/proposal-promise-with-resolvers)

```ts
class Promise {
  static withResolvers(): { promise: Promise, resolve: function, reject: function };
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/promise-with-resolvers
```
