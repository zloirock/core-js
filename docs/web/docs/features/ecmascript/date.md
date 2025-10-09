# ECMAScript: Date

## Modules 
ES5 features with fixes: [`es.date.to-json`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.date.to-json.js) and [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.date.to-primitive.js).

## Built-ins signatures
```ts
class Date {
  toJSON(): string;
  @@toPrimitive(hint: 'default' | 'number' | 'string'): string | number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js/es|stable|actual|full/date
core-js(-pure)/es|stable|actual|full/date/to-json
```

## Examples
```js
new Date(NaN).toString(); // => 'Invalid Date'
```
