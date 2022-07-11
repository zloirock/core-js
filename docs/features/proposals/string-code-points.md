# [`String.prototype.codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints)
Module [`esnext.string.code-points`](/packages/core-js/modules/esnext.string.code-points.js)
```ts
class String {
  codePoints(): Iterator<{ codePoint, position }>;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/string-code-points
core-js(-pure)/full/string/code-points
```
[*Example*](https://goo.gl/Jt7SsD):
```js
for (let { codePoint, position } of 'qwe'.codePoints()) {
  console.log(codePoint); // => 113, 119, 101
  console.log(position);  // => 0, 1, 2
}
```
