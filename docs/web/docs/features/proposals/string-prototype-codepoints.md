# String.prototype.codePoints
Specification: [proposal-string-prototype-codepoints](https://github.com/tc39/proposal-string-prototype-codepoints)

## Module 
[`esnext.string.code-points`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.code-points.js)

```ts
class String {
  codePoints(): Iterator<{ codePoint, position }>;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/string-code-points
core-js(-pure)/full/string/code-points
```

## Example
```js
for (let { codePoint, position } of 'qwe'.codePoints()) {
  console.log(codePoint); // => 113, 119, 101
  console.log(position);  // => 0, 1, 2
}
```
