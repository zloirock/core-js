# [`String#at`](https://github.com/mathiasbynens/String.prototype.at)
**This proposal has been withdrawn and will be removed from the next major `core-js` version.**

Module [`esnext.string.at`](/packages/core-js/modules/esnext.string.at.js)
```js
class String {
  at(index: number): string;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/string-at
core-js(-pure)/full/string/at
core-js(-pure)/full/string/virtual/at
```
[*Examples*](https://goo.gl/XluXI8):
```js
'a𠮷b'.at(1);        // => '𠮷'
'a𠮷b'.at(1).length; // => 2
```
