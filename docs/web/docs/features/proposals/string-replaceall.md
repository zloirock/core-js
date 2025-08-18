# `String#replaceAll`
[Specification](https://tc39.es/proposal-string-replaceall/)\
[Proposal repo](https://github.com/tc39/proposal-string-replace-all)

## Signature
```ts
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/string-replace-all-stage-4
```
