# [`Observable`](https://github.com/zenparsing/es-observable)

## Modules

- [`esnext.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.observable.js)
- [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.observable.js)

## Types

```ts
class Observable {
  constructor(subscriber: Function): Observable;
  subscribe(observer: Function | { next?: Function, error?: Function, complete?: Function }): Subscription;
  @@observable(): this;
  static of(...items: Aray<mixed>): Observable;
  static from(x: Observable | Iterable): Observable;
  static readonly attribute @@species: this;
}

class Symbol {
  static observable: @@observable;
}
```

## Entry points

```
core-js/proposals/observable
core-js(-pure)/full/observable
core-js(-pure)/full/symbol/observable
```

## Example

[_Example_](https://goo.gl/1LDywi):

```js
new Observable((observer) => {
  observer.next("hello");
  observer.next("world");
  observer.complete();
}).subscribe({
  next(it) {
    console.log(it);
  },
  complete() {
    console.log("!");
  },
});
```
