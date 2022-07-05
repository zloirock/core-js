# [`String.cooked`](https://github.com/tc39/proposal-string-cooked)
Module [`esnext.string.cooked`](/packages/core-js/modules/esnext.string.cooked.js)
```js
class String {
  static cooked(template: Array<string>, ...substitutions: Array<string>): string;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js/proposals/string-cooked
core-js(-pure)/full/string/cooked
```
[*Example*](https://is.gd/7QPnss):
```js
function safePath(strings, ...subs) {
  return String.cooked(strings, ...subs.map(sub => encodeURIComponent(sub)));
}

let id = 'spottie?';

safePath`/cats/${ id }`; // => /cats/spottie%3F
```
