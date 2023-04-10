---
category: feature
tag:
  - es-standard
---

# `Promise`

## Modules

- [`es.promise`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.js)
- [`es.promise.all-settled`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.all-settled.js)
- [`es.promise.any`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.any.js)
- [`es.promise.finally`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.promise.finally.js)

## Types

```ts
class Promise<T> {
  constructor(
    executor: (
      resolve: (value: T) => void,
      reject: (reason: any) => void
    ) => void
  );
  then(onFulfilled: Function, onRejected: Function): Promise<T>;
  catch(onRejected: Function): Promise<T>;
  finally(onFinally: Function): Promise<T>;
  static resolve<U>(x: U): Promise<U>;
  static reject<U>(r: U): Promise<U>;
  static all<U>(iterable: Iterable<Promise<U>>): Promise<Array<U>>;
  static allSettled<U>(iterable: Iterable<Promise<U>>): Promise<Array<U>>;
  static any<U>(promises: Iterable<U>): Promise<U>;
  static race<U>(iterable: Iterable<U>): Promise<U>;
}
```

## Entry points

```
core-js(-pure)/es|stable|actual|full/promise
core-js(-pure)/es|stable|actual|full/promise/all-settled
core-js(-pure)/es|stable|actual|full/promise/any
core-js(-pure)/es|stable|actual|full/promise/finally
```

## Examples

Basic [_example_](https://goo.gl/vGrtUC):

```js
function sleepRandom(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time * 1e3, 0 | (Math.random() * 1e3));
  });
}

console.log("Run"); // => Run
sleepRandom(5)
  .then((result) => {
    console.log(result); // => 869, after 5 sec.
    return sleepRandom(10);
  })
  .then((result) => {
    console.log(result); // => 202, after 10 sec.
  })
  .then(() => {
    console.log("immediately after"); // => immediately after
    throw Error("Irror!");
  })
  .then(() => {
    console.log("will not be displayed");
  })
  .catch((x) => console.log(x)); // => => Error: Irror!
```

`Promise.resolve` and `Promise.reject` [_example_](https://goo.gl/vr8TN3):

```js
Promise.resolve(42).then((x) => console.log(x)); // => 42
Promise.reject(42).catch((x) => console.log(x)); // => 42

Promise.resolve($.getJSON("/data.json")); // => ES promise
```

`Promise#finally` [_example_](https://goo.gl/AhyBbJ):

```js
Promise.resolve(42).finally(() => console.log("You will see it anyway"));

Promise.reject(42).finally(() => console.log("You will see it anyway"));
```

`Promise.all` [_example_](https://goo.gl/RdoDBZ):

```js
Promise.all([
  "foo",
  sleepRandom(5),
  sleepRandom(15),
  sleepRandom(10), // after 15 sec:
]).then((x) => console.log(x)); // => ['foo', 956, 85, 382]
```

`Promise.race` [_example_](https://goo.gl/L8ovkJ):

```js
function timeLimit(promise, time) {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      setTimeout(reject, time * 1e3, Error("Await > " + time + " sec"));
    }),
  ]);
}

timeLimit(sleepRandom(5), 10).then((x) => console.log(x)); // => 853, after 5 sec.
timeLimit(sleepRandom(15), 10).catch((x) => console.log(x)); // Error: Await > 10 sec
```

`Promise.allSettled` [_example_](https://goo.gl/PXXLNJ):

```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // => [{ value: 1, status: 'fulfilled' }, { reason: 2, status: 'rejected' }, { value: 3, status: 'fulfilled' }]
```

`Promise.any` [_example_](https://goo.gl/iErvmp):

```js
Promise.any([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)]).then(
  console.log
); // => 1

Promise.any([Promise.reject(1), Promise.reject(2), Promise.reject(3)]).catch(
  ({ errors }) => console.log(errors)
); // => [1, 2, 3]
```

[Example](https://goo.gl/wnQS4j) with async functions:

```js
let delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function sleepRandom(time) {
  await delay(time * 1e3);
  return 0 | (Math.random() * 1e3);
}

async function sleepError(time, msg) {
  await delay(time * 1e3);
  throw Error(msg);
}

(async () => {
  try {
    console.log("Run"); // => Run
    console.log(await sleepRandom(5)); // => 936, after 5 sec.
    let [a, b, c] = await Promise.all([
      sleepRandom(5),
      sleepRandom(15),
      sleepRandom(10),
    ]);
    console.log(a, b, c); // => 210 445 71, after 15 sec.
    await sleepError(5, "Error!");
    console.log("Will not be displayed");
  } catch (e) {
    console.log(e); // => Error: 'Error!', after 5 sec.
  }
})();
```

## Unhandled rejection tracking

In Node.js, like in native implementation, available events [`unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection) and [`rejectionHandled`](https://nodejs.org/api/process.html#process_event_rejectionhandled):

```js
process.on("unhandledRejection", (reason, promise) =>
  console.log("unhandled", reason, promise)
);
process.on("rejectionHandled", (promise) => console.log("handled", promise));

let promise = Promise.reject(42);
// unhandled 42 [object Promise]

setTimeout(() => promise.catch(() => {}), 1e3);
// handled [object Promise]
```

In a browser on rejection, by default, you will see notify in the console, or you can add a custom handler and a handler on handling unhandled, [_example_](https://goo.gl/Wozskl):

```js
window.addEventListener("unhandledrejection", (e) =>
  console.log("unhandled", e.reason, e.promise)
);
window.addEventListener("rejectionhandled", (e) =>
  console.log("handled", e.reason, e.promise)
);
// or
window.onunhandledrejection = (e) =>
  console.log("unhandled", e.reason, e.promise);
window.onrejectionhandled = (e) => console.log("handled", e.reason, e.promise);

let promise = Promise.reject(42);
// => unhandled 42 [object Promise]

setTimeout(() => promise.catch(() => {}), 1e3);
// => handled 42 [object Promise]
```
