# ECMAScript: String and RegExp

## Modules
The main part of `String` features: modules [`es.string.from-code-point`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.from-code-point.js), [`es.string.raw`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.raw.js), [`es.string.iterator`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.iterator.js), [`es.string.split`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.split.js), [`es.string.code-point-at`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.code-point-at.js), [`es.string.ends-with`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.ends-with.js), [`es.string.includes`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.includes.js), [`es.string.repeat`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.repeat.js), [`es.string.pad-start`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.pad-start.js), [`es.string.pad-end`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.pad-end.js), [`es.string.starts-with`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.starts-with.js), [`es.string.trim`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.trim.js), [`es.string.trim-start`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.trim-start.js), [`es.string.trim-left`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.trim-left.js), [`es.string.trim-end`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.trim-end.js), [`es.string.trim-right`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.trim-right.js), [`es.string.match-all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.match-all.js), [`es.string.replace-all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.replace-all.js), [`es.string.at`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.at.js), [`es.string.is-well-formed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.is-well-formed.js), [`es.string.to-well-formed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.to-well-formed.js).

Adding support of well-known [symbols](#ecmascript-symbol) `@@match`, `@@replace`, `@@search` and `@@split` and direct `.exec` calls to related `String` methods, modules [`es.string.match`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.match.js), [`es.string.replace`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.replace.js), [`es.string.search`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.search.js) and [`es.string.split`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.split.js).

Annex B methods. Modules [`es.string.anchor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.anchor.js), [`es.string.big`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.big.js), [`es.string.blink`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.blink.js), [`es.string.bold`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.bold.js), [`es.string.fixed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.fixed.js), [`es.string.fontcolor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.fontcolor.js), [`es.string.fontsize`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.fontsize.js), [`es.string.italics`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.italics.js), [`es.string.link`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.link.js), [`es.string.small`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.small.js), [`es.string.strike`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.strike.js), [`es.string.sub`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.sub.js), [`es.string.sup`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.sup.js).

`RegExp` features: modules [`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.constructor.js), [`es.regexp.escape`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.escape.js), [`es.regexp.dot-all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.dot-all.js), [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.flags.js), [`es.regexp.sticky`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.sticky.js) and [`es.regexp.test`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.test.js).

## Built-ins signatures
```ts
class String {
  static fromCodePoint(...codePoints: Array<number>): string;
  static raw({ raw: Array<string> }, ...substitutions: Array<string>): string;
  at(index: int): string;
  includes(searchString: string, position?: number): boolean;
  startsWith(searchString: string, position?: number): boolean;
  endsWith(searchString: string, position?: number): boolean;
  repeat(count: number): string;
  padStart(length: number, fillStr?: string = ' '): string;
  padEnd(length: number, fillStr?: string = ' '): string;
  codePointAt(pos: number): number | void;
  match(template: any): any; // ES2015+ fix for support @@match
  matchAll(regexp: RegExp): Iterator;
  replace(template: any, replacer: any): any; // ES2015+ fix for support @@replace
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
  search(template: any): any; // ES2015+ fix for support @@search
  split(template: any, limit?: int): Array<string>;; // ES2015+ fix for support @@split, some fixes for old engines
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
  sup(): string;
  @@iterator(): Iterator<characters>;
}

class RegExp {
  // support of sticky (`y`) flag, dotAll (`s`) flag, named capture groups, can alter flags
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  static escape(value: string): string
  exec(): Array<string | undefined> | null; // IE8 fixes
  test(string: string): boolean; // delegation to `.exec`
  toString(): string; // ES2015+ fix - generic
  @@match(string: string): Array | null;
  @@matchAll(string: string): Iterator;
  @@replace(string: string, replaceValue: Function | string): string;
  @@search(string: string): number;
  @@split(string: string, limit: number): Array<string>;
  readonly attribute dotAll: boolean; // IE9+
  readonly attribute flags: string;   // IE9+
  readonly attribute sticky: boolean; // IE9+
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/string
core-js(-pure)/es|stable|actual|full/string/from-code-point
core-js(-pure)/es|stable|actual|full/string/raw
core-js/es|stable|actual|full/string/match
core-js/es|stable|actual|full/string/replace
core-js/es|stable|actual|full/string/search
core-js/es|stable|actual|full/string/split
core-js(-pure)/es|stable|actual/string(/prototype)/at
core-js(-pure)/es|stable|actual|full/string(/prototype)/code-point-at
core-js(-pure)/es|stable|actual|full/string(/prototype)/ends-with
core-js(-pure)/es|stable|actual|full/string(/prototype)/includes
core-js(-pure)/es|stable|actual|full/string(/prototype)/starts-with
core-js(-pure)/es|stable|actual|full/string(/prototype)/match-all
core-js(-pure)/es|stable|actual|full/string(/prototype)/pad-start
core-js(-pure)/es|stable|actual|full/string(/prototype)/pad-end
core-js(-pure)/es|stable|actual|full/string(/prototype)/repeat
core-js(-pure)/es|stable|actual|full/string(/prototype)/replace-all
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-start
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-end
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-left
core-js(-pure)/es|stable|actual|full/string(/prototype)/trim-right
core-js(-pure)/es|stable|actual|full/string(/prototype)/is-well-formed
core-js(-pure)/es|stable|actual|full/string(/prototype)/to-well-formed
core-js(-pure)/es|stable|actual|full/string(/prototype)/anchor
core-js(-pure)/es|stable|actual|full/string(/prototype)/big
core-js(-pure)/es|stable|actual|full/string(/prototype)/blink
core-js(-pure)/es|stable|actual|full/string(/prototype)/bold
core-js(-pure)/es|stable|actual|full/string(/prototype)/fixed
core-js(-pure)/es|stable|actual|full/string(/prototype)/fontcolor
core-js(-pure)/es|stable|actual|full/string(/prototype)/fontsize
core-js(-pure)/es|stable|actual|full/string(/prototype)/italics
core-js(-pure)/es|stable|actual|full/string(/prototype)/link
core-js(-pure)/es|stable|actual|full/string(/prototype)/small
core-js(-pure)/es|stable|actual|full/string(/prototype)/strike
core-js(-pure)/es|stable|actual|full/string(/prototype)/sub
core-js(-pure)/es|stable|actual|full/string(/prototype)/sup
core-js(-pure)/es|stable|actual|full/string(/prototype)/iterator
core-js/es|stable|actual|full/regexp
core-js/es|stable|actual|full/regexp/constructor
core-js(-pure)/es|stable|actual|full/regexp/escape
core-js/es|stable|actual|full/regexp/dot-all
core-js(-pure)/es|stable|actual|full/regexp/flags
core-js/es|stable|actual|full/regexp/sticky
core-js/es|stable|actual|full/regexp/test
core-js/es|stable|actual|full/regexp/to-string
```

## Examples
```js
for (let value of 'a𠮷b') {
  console.log(value); // => 'a', '𠮷', 'b'
}

'foobarbaz'.includes('bar');      // => true
'foobarbaz'.includes('bar', 4);   // => false
'foobarbaz'.startsWith('foo');    // => true
'foobarbaz'.startsWith('bar', 3); // => true
'foobarbaz'.endsWith('baz');      // => true
'foobarbaz'.endsWith('bar', 6);   // => true

'string'.repeat(3); // => 'stringstringstring'

'hello'.padStart(10);         // => '     hello'
'hello'.padStart(10, '1234'); // => '12341hello'
'hello'.padEnd(10);           // => 'hello     '
'hello'.padEnd(10, '1234');   // => 'hello12341'

'𠮷'.codePointAt(0); // => 134071
String.fromCodePoint(97, 134071, 98); // => 'a𠮷b'

let name = 'Bob';
String.raw`Hi\n${ name }!`;           // => 'Hi\\nBob!' (ES2015 template string syntax)
String.raw({ raw: 'test' }, 0, 1, 2); // => 't0e1s2t'

'foo'.bold();                      // => '<b>foo</b>'
'bar'.anchor('a"b');               // => '<a name="a&quot;b">bar</a>'
'baz'.link('https://example.com'); // => '<a href="https://example.com">baz</a>'

RegExp('.', 's').test('\n'); // => true
RegExp('.', 's').dotAll;     // => true

RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)').exec('foo:abc,bar:def').groups; // => { foo: 'abc', bar: 'def' }

'foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), '$<bar>,$<foo>'); // => 'def,abc'

// eslint-disable-next-line regexp/no-useless-flag -- example
RegExp(/./g, 'm'); // => /./m

/foo/.flags;   // => ''
/foo/gi.flags; // => 'gi'

RegExp('foo', 'y').sticky; // => true

const text = 'First line\nSecond line';
const regex = RegExp('(?<index>\\S+) line\\n?', 'y');

regex.exec(text).groups.index; // => 'First'
regex.exec(text).groups.index; // => 'Second'
regex.exec(text);    // => null

'foo'.match({ [Symbol.match]: () => 1 });     // => 1
'foo'.replace({ [Symbol.replace]: () => 2 }); // => 2
'foo'.search({ [Symbol.search]: () => 3 });   // => 3
'foo'.split({ [Symbol.split]: () => 4 });     // => 4

RegExp.prototype.toString.call({ source: 'foo', flags: 'bar' }); // => '/foo/bar'

'   hello   '.trimLeft();  // => 'hello   '
'   hello   '.trimRight(); // => '   hello'
'   hello   '.trimStart(); // => 'hello   '
'   hello   '.trimEnd();   // => '   hello'

for (let { groups: { number, letter } } of '1111a2b3cccc'.matchAll(RegExp('(?<number>\\d)(?<letter>\\D)', 'g'))) {
  console.log(number, letter); // => 1 a, 2 b, 3 c
}

'Test abc test test abc test.'.replaceAll('abc', 'foo'); // -> 'Test foo test test foo test.'

'abc'.at(1);  // => 'b'
'abc'.at(-1); // => 'c'

'a💩b'.isWellFormed();      // => true
'a\uD83Db'.isWellFormed();  // => false

'a💩b'.toWellFormed();      // => 'a💩b'
'a\uD83Db'.toWellFormed();  // => 'a�b'
```

## Examples
```js
console.log(RegExp.escape('10$')); // => '\\x310\\$'
console.log(RegExp.escape('abcdefg_123456')); // => '\\x61bcdefg_123456'
console.log(RegExp.escape('Привет')); // => 'Привет'
console.log(RegExp.escape('(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`'));
// => '\\(\\)\\{\\}\\[\\]\\|\\x2c\\.\\?\\*\\+\\x2d\\^\\$\\x3d\\x3c\\x3e\\\\\\/\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x22\\x60'
console.log(RegExp.escape('\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'));
// => '\\\t\\\n\\\v\\\f\\\r\\x20\\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\u2028\\u2029\\ufeff'
console.log(RegExp.escape('💩')); // => '💩'
console.log(RegExp.escape('\uD83D')); // => '\\ud83d'
```
