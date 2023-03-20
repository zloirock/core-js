---
category: feature
tag:
  - es-proposal
---

# [`Observable`](https://github.com/zenparsing/es-observable)

## 模块

- [`esnext.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.observable.js)
- [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.observable.js)

## 类型

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

## 入口点

```
core-js/proposals/observable
core-js(-pure)/full/observable
core-js(-pure)/full/symbol/observable
```

## 示例

[_示例_](https://goo.gl/1LDywi):

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
