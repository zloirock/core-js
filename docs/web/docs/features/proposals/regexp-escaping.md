# `RegExp` escaping
[Specification](https://tc39.es/proposal-regex-escaping/)\
[Proposal repo](https://github.com/tc39/proposal-regex-escaping)

## Modules
[`es.regexp.escape`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.escape.js).

## Built-ins signatures
```ts
class RegExp {
  static escape(value: string): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/regexp-escaping
core-js(-pure)/es|stable|actual|full/regexp/escape
```

## Examples
```js
RegExp.escape('10$'); // => '\\x310\\$'
RegExp.escape('abcdefg_123456'); // => '\\x61bcdefg_123456'
RegExp.escape('Привет'); // => 'Привет'
RegExp.escape('(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`');
// => '\\(\\)\\{\\}\\[\\]\\|\\x2c\\.\\?\\*\\+\\x2d\\^\\$\\x3d\\x3c\\x3e\\\\\\/\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x22\\x60'
RegExp.escape('\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF');
// => '\\t\\n\\v\\f\\r\\x20\\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\u2028\\u2029\\ufeff'
RegExp.escape('💩'); // => '💩'
RegExp.escape('\uD83D'); // => '\\ud83d'
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/regexp-escaping`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/regexp-escaping.d.ts)
