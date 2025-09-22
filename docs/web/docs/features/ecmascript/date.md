# ECMAScript: Date
## Modules 
[`es.date.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-string.js), ES5 features with fixes: [`es.date.now`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.now.js), [`es.date.to-iso-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-iso-string.js), [`es.date.to-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-json.js) and [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-primitive.js).

Annex B methods. Modules [`es.date.get-year`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.get-year.js), [`es.date.set-year`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.set-year.js) and [`es.date.to-gmt-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-gmt-string.js).

## Built-ins signatures
```ts
class Date {
  getYear(): int;
  setYear(year: int): number;
  toGMTString(): string;
  toISOString(): string;
  toJSON(): string;
  toString(): string;
  @@toPrimitive(hint: 'default' | 'number' | 'string'): string | number;
  static now(): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js/es|stable|actual|full/date
core-js/es|stable|actual|full/date/to-string
core-js(-pure)/es|stable|actual|full/date/now
core-js(-pure)/es|stable|actual|full/date/get-year
core-js(-pure)/es|stable|actual|full/date/set-year
core-js(-pure)/es|stable|actual|full/date/to-gmt-string
core-js(-pure)/es|stable|actual|full/date/to-iso-string
core-js(-pure)/es|stable|actual|full/date/to-json
core-js(-pure)/es|stable|actual|full/date/to-primitive
```

## Examples
```js
new Date(NaN).toString(); // => 'Invalid Date'
```
