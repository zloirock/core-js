# `String` and `RegExp`
The main part of `String` features: modules [`es.string.from-code-point`](/packages/core-js/modules/es.string.from-code-point.js), [`es.string.raw`](/packages/core-js/modules/es.string.raw.js), [`es.string.iterator`](/packages/core-js/modules/es.string.iterator.js), [`es.string.split`](/packages/core-js/modules/es.string.split.js), [`es.string.code-point-at`](/packages/core-js/modules/es.string.code-point-at.js), [`es.string.ends-with`](/packages/core-js/modules/es.string.ends-with.js), [`es.string.includes`](/packages/core-js/modules/es.string.includes.js), [`es.string.repeat`](/packages/core-js/modules/es.string.repeat.js), [`es.string.pad-start`](/packages/core-js/modules/es.string.pad-start.js), [`es.string.pad-end`](/packages/core-js/modules/es.string.pad-end.js), [`es.string.starts-with`](/packages/core-js/modules/es.string.starts-with.js), [`es.string.trim`](/packages/core-js/modules/es.string.trim.js), [`es.string.trim-start`](/packages/core-js/modules/es.string.trim-start.js), [`es.string.trim-end`](/packages/core-js/modules/es.string.trim-end.js), [`es.string.match-all`](/packages/core-js/modules/es.string.match-all.js), [`es.string.replace-all`](/packages/core-js/modules/es.string.replace-all.js), [`es.string.at-alternative`](/packages/core-js/modules/es.string.at-alternative.js).

Adding support of well-known [symbols](./Symbol.md) `@@match`, `@@replace`, `@@search` and `@@split` and direct `.exec` calls to related `String` methods, modules [`es.string.match`](/packages/core-js/modules/es.string.match.js), [`es.string.replace`](/packages/core-js/modules/es.string.replace.js), [`es.string.search`](/packages/core-js/modules/es.string.search.js) and [`es.string.split`](/packages/core-js/modules/es.string.split.js).

Annex B methods. Modules [`es.string.anchor`](/packages/core-js/modules/es.string.anchor.js), [`es.string.big`](/packages/core-js/modules/es.string.big.js), [`es.string.blink`](/packages/core-js/modules/es.string.blink.js), [`es.string.bold`](/packages/core-js/modules/es.string.bold.js), [`es.string.fixed`](/packages/core-js/modules/es.string.fixed.js), [`es.string.fontcolor`](/packages/core-js/modules/es.string.fontcolor.js), [`es.string.fontsize`](/packages/core-js/modules/es.string.fontsize.js), [`es.string.italics`](/packages/core-js/modules/es.string.italics.js), [`es.string.link`](/packages/core-js/modules/es.string.link.js), [`es.string.small`](/packages/core-js/modules/es.string.small.js), [`es.string.strike`](/packages/core-js/modules/es.string.strike.js), [`es.string.sub`](/packages/core-js/modules/es.string.sub.js), [`es.string.sup`](/packages/core-js/modules/es.string.sup.js), [`es.string.substr`](/packages/core-js/modules/es.string.substr.js), [`es.escape`](/packages/core-js/modules/es.escape.js) and [`es.unescape`](/packages/core-js/modules/es.unescape.js).

`RegExp` features: modules [`es.regexp.constructor`](/packages/core-js/modules/es.regexp.constructor.js), [`es.regexp.dot-all`](/packages/core-js/modules/es.regexp.dot-all.js), [`es.regexp.flags`](/packages/core-js/modules/es.regexp.flags.js), [`es.regexp.sticky`](/packages/core-js/modules/es.regexp.sticky.js) and [`es.regexp.test`](/packages/core-js/modules/es.regexp.test.js).
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
  substr(start: int, length?: int): string;
  sup(): string;
  @@iterator(): Iterator<characters>;
}

class RegExp {
  // support of sticky (`y`) flag, dotAll (`s`) flag, named capture groups, can alter flags
  constructor(pattern: RegExp | string, flags?: string): RegExp;
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

function escape(string: string): string;
function unescape(string: string): string;
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
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
[*Examples*](https://is.gd/Q8eRhG):
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
String.raw`Hi\n${name}!`;             // => 'Hi\\nBob!' (ES2015 template string syntax)
String.raw({ raw: 'test' }, 0, 1, 2); // => 't0e1s2t'

'foo'.bold();                      // => '<b>foo</b>'
'bar'.anchor('a"b');               // => '<a name="a&quot;b">bar</a>'
'baz'.link('https://example.com'); // => '<a href="https://example.com">baz</a>'

RegExp('.', 's').test('\n'); // => true
RegExp('.', 's').dotAll;     // => true

RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)').exec('foo:abc,bar:def').groups.bar; // => 'def'

'foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), '$<bar>,$<foo>'); // => 'def,abc'

RegExp(/./g, 'm'); // => /./m

/foo/.flags;    // => ''
/foo/gim.flags; // => 'gim'

RegExp('foo', 'y').sticky; // => true

const text = 'First line\nSecond line';
const regex = RegExp('(\\S+) line\\n?', 'y');

regex.exec(text)[1]; // => 'First'
regex.exec(text)[1]; // => 'Second'
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

for (let [_, d, D] of '1111a2b3cccc'.matchAll(/(\d)(\D)/g)) {
  console.log(d, D); // => 1 a, 2 b, 3 c
}

'Test abc test test abc test.'.replaceAll('abc', 'foo'); // -> 'Test foo test test foo test.'

'abc'.at(1);  // => 'b'
'abc'.at(-1); // => 'c'
```
