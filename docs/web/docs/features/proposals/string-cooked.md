# String.cooked
[Specification](https://tc39.es/proposal-string-cooked/)\
[Proposal repo](https://github.com/tc39/proposal-string-cooked)

## Module
[`esnext.string.cooked`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.string.cooked.js)

## Built-ins signatures
```ts
class String {
  static cooked(template: Array<string>, ...substitutions: Array<string>): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-cooked
core-js(-pure)/full/string/cooked
```

## Example
```js
function safePath(strings, ...subs) {
  return String.cooked(strings, ...subs.map(sub => encodeURIComponent(sub)));
}

let id = 'spottie?';

safePath`/cats/${ id }`; // => /cats/spottie%3F
```
