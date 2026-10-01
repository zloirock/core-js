# ECMAScript: Function

## Modules
[`es.function.name`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.function.name.js), [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.function.has-instance.js).

## Built-ins signatures
```ts
class Function {
  name: string;
  @@hasInstance(value: any): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/es|stable|actual|full/function
core-js/es|stable|actual|full/function/name
core-js/es|stable|actual|full/function/instance/name
core-js/es|stable|actual|full/instance/name
```

## Examples
```js
(function foo() { /* empty */ }).name; // => 'foo'
```

```js
// pure version
import getName from '@core-js/pure/es/function/name';

getName(function foo() { /* empty */ }); // => 'foo'
```
