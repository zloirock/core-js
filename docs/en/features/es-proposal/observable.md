---
category: feature
tag:
  - es-proposal
---

# [`Observable`](https://github.com/zenparsing/es-observable)

## Modules

- [`esnext.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.observable.js)
- [`esnext.symbol.observable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.observable.js)

## Types

```ts
class Observable {
  constructor(subscriber: SubscriberFunction);
  static of<T>(...items: Array<T>): SubscriptionObserver<T>;
  static from<T>(
    x: SubscriptionObserver<T> | Iterable<T>
  ): SubscriptionObserver<T>;
  static readonly [Symbol.species]: Observable;
  subscribe<T>(observer: Observer<T>): Subscription;
  subscribe<T>(
    onNext: (value: T) => void,
    onError?: (errorValue: Error) => void,
    onComplete?: () => void
  ): Subscription;
  [Symbol.observable](): this;
}

interface Subscription {
  unsubscribe(): void;
  get closed(): boolean;
}

interface Observer<T> {
  start(subscription: Subscription): void;
  next(value: T): void;
  error(errorValue: Error): void;
  complete(): void;
}

interface SubscriptionObserver<T> {
  next(value: T): void;
  error(errorValue: Error): void;
  complete(): void;
  get closed(): Boolean;
}

type SubscriberFunction = (observer: Observer) => (() => void) | Subscription;

interface SymbolConstructor {
  readonly observable: unique symbol;
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
