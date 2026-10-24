# ECMAScript: Date

## Modules
[`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.date.to-primitive.js), ES5 feature with fixes: [`es.date.to-json`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.date.to-json.js).

## Built-ins signatures
```ts
class Date {
  toJSON(): string | null;
  @@toPrimitive(hint: 'default' | 'number' | 'string'): string | number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/es|stable|actual|full/date
{ core-js, @core-js/pure }/es|stable|actual|full/date/to-json
```

## Examples
```js
new Date(NaN).toString(); // => 'Invalid Date'
```
