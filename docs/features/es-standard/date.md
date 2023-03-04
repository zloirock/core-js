# `Date`

## Modules

- [`es.date.to-string`](/packages/core-js/modules/es.date.to-string.js)

_ES5 features with fixes:_

- [`es.date.now`](/packages/core-js/modules/es.date.now.js)
- [`es.date.to-iso-string`](/packages/core-js/modules/es.date.to-iso-string.js)
- [`es.date.to-json`](/packages/core-js/modules/es.date.to-json.js)
- [`es.date.to-primitive`](/packages/core-js/modules/es.date.to-primitive.js)

_Annex B methods modules:_

- [`es.date.get-year`](/packages/core-js/modules/es.date.get-year.js)
- [`es.date.set-year`](/packages/core-js/modules/es.date.set-year.js)
- [`es.date.to-gmt-string`](/packages/core-js/modules/es.date.to-gmt-string.js).

## Types

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

## Entry points

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

## Example

[_Example_](https://goo.gl/haeHLR):

```js
new Date(NaN).toString(); // => 'Invalid Date'
```
