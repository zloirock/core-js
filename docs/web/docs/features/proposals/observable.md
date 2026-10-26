# Observable
[Specification](https://tc39.es/proposal-observable/)\
[Proposal repo](https://github.com/tc39/proposal-observable)

## Modules
[`esnext.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.observable.js), [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.observable.js).

## Built-ins signatures
```ts
class Observable {
  constructor(subscriber: Function): Observable;
  subscribe(observer: { start?: Function, next?: Function, error?: Function, complete?: Function }): Subscription;
  subscribe(next: Function, error?: Function, complete?: Function): Subscription;
  @@observable(): this;
  static of(...items: Array<mixed>): Observable;
  static from(x: Observable | Iterable): Observable;
  static readonly attribute @@species: this;
}

class Symbol {
  static observable: @@observable;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/observable
core-js(-pure)/full/observable
core-js(-pure)/full/symbol/observable
```

## Examples
```js
new Observable(observer => {
  observer.next('hello');
  observer.next('world');
  observer.complete();
}).subscribe({
  next(it) { console.log(it); },
  complete() { console.log('!'); },
});
```
