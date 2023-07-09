---
category: feature
tag:
  - es-standard
---

# `String` 和 `RegExp`

## 模块

`String` 特性的主要部分：

- [`es.string.from-code-point`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.from-code-point.js)
- [`es.string.raw`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.raw.js)
- [`es.string.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.iterator.js)
- [`es.string.split`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.split.js)
- [`es.string.code-point-at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.code-point-at.js)
- [`es.string.ends-with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.ends-with.js)
- [`es.string.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.includes.js)
- [`es.string.repeat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.repeat.js)
- [`es.string.pad-start`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.pad-start.js)
- [`es.string.pad-end`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.pad-end.js)
- [`es.string.starts-with`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.starts-with.js)
- [`es.string.trim`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim.js)
- [`es.string.trim-start`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-start.js)
- [`es.string.trim-end`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-end.js)
- [`es.string.match-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.match-all.js)
- [`es.string.replace-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.replace-all.js)
- [`es.string.at-alternative`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.at-alternative.js)
- [`es.string.is-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.is-well-formed.js)
- [`es.string.to-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.to-well-formed.js)

支持著名的 [symbols](./symbol.md) `@@match`, `@@replace`, `@@search` 和 `@@split`，并把 `.exec` 调用定向至 `String` 相关的方法：

- [`es.string.match`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.match.js)
- [`es.string.replace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.replace.js)
- [`es.string.search`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.search.js)
- [`es.string.split`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.split.js)

Annex B 方法：

- [`es.string.anchor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.anchor.js)
- [`es.string.big`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.big.js)
- [`es.string.blink`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.blink.js)
- [`es.string.bold`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.bold.js)
- [`es.string.fixed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.fixed.js)
- [`es.string.fontcolor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.fontcolor.js)
- [`es.string.fontsize`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.fontsize.js)
- [`es.string.italics`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.italics.js)
- [`es.string.link`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.link.js)
- [`es.string.small`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.small.js)
- [`es.string.strike`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.strike.js)
- [`es.string.sub`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.sub.js)
- [`es.string.sup`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.sup.js)
- [`es.string.substr`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.substr.js)
- [`es.escape`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.escape.js)
- [`es.unescape`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.unescape.js)

`RegExp` 特性：

- [`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.constructor.js)
- [`es.regexp.dot-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.dot-all.js)
- [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.flags.js)
- [`es.regexp.sticky`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.sticky.js)
- [`es.regexp.test`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.test.js)

## 类型

```ts
interface String {
  at(index: number): string;
  includes(searchString: string, position?: number): boolean;
  startsWith(searchString: string, position?: number): boolean;
  endsWith(searchString: string, position?: number): boolean;
  repeat(count: number): string;
  /**@param fillStr @default ' '' */
  padStart(length: number, fillStr?: string): string;
  /**@param fillStr @default ' '' */
  padEnd(length: number, fillStr?: string): string;
  codePointAt(pos: number): number | void;
  match(template: any): RegExpMatchArray | null; // 针对 ES2015+ 的修复，支持 @@match
  matchAll(regexp: RegExp): Iterator<RegExpMatchArray>;
  replace(template: any, replacer: any): any; // 针对 ES2015+ 的修复，支持 @@replace
  replaceAll(
    searchValue: string | RegExp,
    replacer: string | ((searchValue: string, ...args: any[]) => string)
  ): string;
  search(template: any): any; // 针对 ES2015+ 的修复，支持 @@search
  split(template: any, limit?: number): Array<string>; // 针对 ES2015+ 的修复，支持 @@split，一些针对老引擎的修复
  trim(): string;
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
  isWellFormed(): boolean;
  toWellFormed(): string;
  anchor(name: string): string;
  big(): string;
  blink(): string;
  bold(): string;
  fixed(): string;
  fontcolor(color: string): string;
  fontsize(size: any): string;
  italics(): string;
  link(url: string): string;
  small(): string;
  strike(): string;
  sub(): string;
  substr(start: number, length?: number): string;
  sup(): string;
  [Symbol.iterator]: Iterator<String>;
}

interface StringConstructor {
  fromCodePoint(...codePoints: Array<number>): string;
  raw({ ["raw"]: Array }, ...substitutions: Array<string>): string;
}

class RegExp {
  // 支持 sticky (`y`) flag, dotAll (`s`) flag, 命名捕获组，可以改变 flag
  constructor(pattern: RegExp | string, flags?: string);
  exec(): Array<string | undefined> | null; // IE8 修复
  test(string: string): boolean; // delegation to `.exec`
  toString(): string; // 通用的 ES2015+ 修复
  [Symbol.match](string: string): RegExpMatchArray | null;
  [Symbol.matchAll](string: string): Iterator<RegExpMatchArray>;
  [Symbol.replace](string: string, replaceValue: Function | string): string;
  [Symbol.search](string: string): number;
  [Symbol.split](string: string, limit: number): Array<string>;
  readonly dotAll: boolean; // IE9+
  readonly flags: string; // IE9+
  readonly sticky: boolean; // IE9+
}

function escape(string: string): string;
function unescape(string: string): string;
```

## 入口点

```
core-js(-pure)/es|stable|actual|full/string
core-js(-pure)/es|stable|actual|full/string/from-code-point
core-js(-pure)/es|stable|actual|full/string/raw
core-js/es|stable|actual|full/string/match
core-js/es|stable|actual|full/string/replace
core-js/es|stable|actual|full/string/search
core-js/es|stable|actual|full/string/split
core-js(-pure)/es|stable|actual/string(/virtual)/at
core-js(-pure)/es|stable|actual|full/string(/virtual)/code-point-at
core-js(-pure)/es|stable|actual|full/string(/virtual)/ends-with
core-js(-pure)/es|stable|actual|full/string(/virtual)/includes
core-js(-pure)/es|stable|actual|full/string(/virtual)/starts-with
core-js(-pure)/es|stable|actual|full/string(/virtual)/match-all
core-js(-pure)/es|stable|actual|full/string(/virtual)/pad-start
core-js(-pure)/es|stable|actual|full/string(/virtual)/pad-end
core-js(-pure)/es|stable|actual|full/string(/virtual)/repeat
core-js(-pure)/es|stable|actual|full/string(/virtual)/replace-all
core-js(-pure)/es|stable|actual|full/string(/virtual)/trim
core-js(-pure)/es|stable|actual|full/string(/virtual)/trim-start
core-js(-pure)/es|stable|actual|full/string(/virtual)/trim-end
core-js(-pure)/es|stable|actual|full/string(/virtual)/trim-left
core-js(-pure)/es|stable|actual|full/string(/virtual)/trim-right
core-js(-pure)/es|stable|actual|full/string(/virtual)/is-well-formed
core-js(-pure)/es|stable|actual|full/string(/virtual)/to-well-formed
core-js(-pure)/es|stable|actual|full/string(/virtual)/anchor
core-js(-pure)/es|stable|actual|full/string(/virtual)/big
core-js(-pure)/es|stable|actual|full/string(/virtual)/blink
core-js(-pure)/es|stable|actual|full/string(/virtual)/bold
core-js(-pure)/es|stable|actual|full/string(/virtual)/fixed
core-js(-pure)/es|stable|actual|full/string(/virtual)/fontcolor
core-js(-pure)/es|stable|actual|full/string(/virtual)/fontsize
core-js(-pure)/es|stable|actual|full/string(/virtual)/italics
core-js(-pure)/es|stable|actual|full/string(/virtual)/link
core-js(-pure)/es|stable|actual|full/string(/virtual)/small
core-js(-pure)/es|stable|actual|full/string(/virtual)/strike
core-js(-pure)/es|stable|actual|full/string(/virtual)/sub
core-js(-pure)/es|stable|actual|full/string(/virtual)/substr
core-js(-pure)/es|stable|actual|full/string(/virtual)/sup
core-js(-pure)/es|stable|actual|full/string(/virtual)/iterator
core-js/es|stable|actual|full/regexp
core-js/es|stable|actual|full/regexp/constructor
core-js/es|stable|actual|full/regexp/dot-all
core-js(-pure)/es|stable|actual|full/regexp/flags
core-js/es|stable|actual|full/regexp/sticky
core-js/es|stable|actual|full/regexp/test
core-js/es|stable|actual|full/regexp/to-string
core-js/es|stable|actual|full/escape
core-js/es|stable|actual|full/unescape
```

## E 示例

[_示例_](https://is.gd/Q8eRhG):

```js
for (let value of "a𠮷b") {
  console.log(value); // => 'a', '𠮷', 'b'
}

"foobarbaz".includes("bar"); // => true
"foobarbaz".includes("bar", 4); // => false
"foobarbaz".startsWith("foo"); // => true
"foobarbaz".startsWith("bar", 3); // => true
"foobarbaz".endsWith("baz"); // => true
"foobarbaz".endsWith("bar", 6); // => true

"string".repeat(3); // => 'stringstringstring'

"hello".padStart(10); // => '     hello'
"hello".padStart(10, "1234"); // => '12341hello'
"hello".padEnd(10); // => 'hello     '
"hello".padEnd(10, "1234"); // => 'hello12341'

"𠮷".codePointAt(0); // => 134071
String.fromCodePoint(97, 134071, 98); // => 'a𠮷b'

let name = "Bob";
String.raw`Hi\n${name}!`; // => 'Hi\\nBob!' (ES2015 模板字符串语法)
String.raw({ raw: "test" }, 0, 1, 2); // => 't0e1s2t'

"foo".bold(); // => '<b>foo</b>'
"bar".anchor('a"b'); // => '<a name="a&quot;b">bar</a>'
"baz".link("https://example.com"); // => '<a href="https://example.com">baz</a>'

RegExp(".", "s").test("\n"); // => true
RegExp(".", "s").dotAll; // => true

RegExp("foo:(?<foo>\\w+),bar:(?<bar>\\w+)").exec("foo:abc,bar:def").groups.bar; // => 'def'

"foo:abc,bar:def".replace(
  RegExp("foo:(?<foo>\\w+),bar:(?<bar>\\w+)"),
  "$<bar>,$<foo>"
); // => 'def,abc'

RegExp(/./g, "m"); // => /./m

/foo/.flags; // => ''
/foo/gim.flags; // => 'gim'

RegExp("foo", "y").sticky; // => true

const text = "First line\nSecond line";
const regex = RegExp("(\\S+) line\\n?", "y");

regex.exec(text)[1]; // => 'First'
regex.exec(text)[1]; // => 'Second'
regex.exec(text); // => null

"foo".match({ [Symbol.match]: () => 1 }); // => 1
"foo".replace({ [Symbol.replace]: () => 2 }); // => 2
"foo".search({ [Symbol.search]: () => 3 }); // => 3
"foo".split({ [Symbol.split]: () => 4 }); // => 4

RegExp.prototype.toString.call({ source: "foo", flags: "bar" }); // => '/foo/bar'

"   hello   ".trimLeft(); // => 'hello   '
"   hello   ".trimRight(); // => '   hello'
"   hello   ".trimStart(); // => 'hello   '
"   hello   ".trimEnd(); // => '   hello'

for (let [_, d, D] of "1111a2b3cccc".matchAll(/(\d)(\D)/g)) {
  console.log(d, D); // => 1 a, 2 b, 3 c
}

"Test abc test test abc test.".replaceAll("abc", "foo"); // -> 'Test foo test test foo test.'

"abc".at(1); // => 'b'
"abc".at(-1); // => 'c'

"a💩b".isWellFormed(); // => true
"a\uD83Db".isWellFormed(); // => false
"a💩b".toWellFormed(); // => 'a💩b'
"a\uD83Db".toWellFormed(); // => 'a�b'
```
