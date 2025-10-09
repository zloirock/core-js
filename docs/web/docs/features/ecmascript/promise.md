# ECMAScript: Promise

## Modules
[`es.promise`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.js), [`es.promise.catch`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.catch.js), [`es.promise.finally`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.finally.js), [`es.promise.resolve`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.resolve.js), [`es.promise.reject`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.reject.js), [`es.promise.all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.all.js), [`es.promise.race`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.race.js), [`es.promise.all-settled`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.all-settled.js), [`es.promise.any`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.any.js), [`es.promise.try`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.try.js) and [`es.promise.with-resolvers`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.promise.with-resolvers.js).

## Built-ins signatures
```ts
class Promise {
  constructor(executor: (resolve: Function, reject: Function) => void): Promise;
  then(onFulfilled: Function, onRejected: Function): Promise;
  catch(onRejected: Function): Promise;
  finally(onFinally: Function): Promise;
  static all(iterable: Iterable): Promise;
  static allSettled(iterable: Iterable): Promise;
  static any(promises: Iterable): Promise;
  static race(iterable: Iterable): Promise;
  static reject(r: any): Promise;
  static resolve(x: any): Promise;
  static try(callbackfn: Function, ...args?: Array<mixed>): Promise;
  static withResolvers(): { promise: Promise, resolve: function, reject: function };
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/promise
core-js(-pure)/es|stable|actual|full/promise/all-settled
core-js(-pure)/es|stable|actual|full/promise/any
core-js(-pure)/es|stable|actual|full/promise/finally
core-js(-pure)/es|stable|actual|full/promise/try
core-js(-pure)/es|stable|actual|full/promise/with-resolvers
```

## Basic example
```js
function sleepRandom(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3);
  });
}

console.log('Run');                    // -> Run
sleepRandom(5).then(result => {
  console.log(result);                 // -> 869, after 5 sec.
  return sleepRandom(10);
}).then(result => {
  console.log(result);                 // -> 202, after 10 sec.
}).then(() => {
  console.log('immediately after');    // -> immediately after
  throw new Error('Irror!');
}).then(() => {
  console.log('will not be displayed');
}).catch(error => console.log(error)); // -> Error: Irror!
```

## `Promise.resolve` and `Promise.reject` example
```js
const getJson = () => new Promise(resolve => {
  resolve({ message: "Hello, world!", success: true });
});

Promise.resolve(42).then(x => console.log(x));         // -> 42
Promise.reject(42).catch(error => console.log(error)); // -> 42

Promise.resolve(getJson()); // => ES promise
```

## `Promise#finally` example
```js
Promise.resolve(42).finally(() => console.log('You will see it anyway'));

Promise.reject(42).finally(() => console.log('You will see it anyway'));
```

## `Promise.all` example
```js
function sleepRandom(time) {
  return new Promise(resolve => setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3));
}

Promise.all([
  'foo',
  sleepRandom(5),
  sleepRandom(15),
  sleepRandom(10),            // after 15 sec:
]).then(x => console.log(x)); // -> ['foo', 956, 85, 382]
```

## `Promise.race` example
```js
function sleepRandom(time) {
  return new Promise(resolve => setTimeout(resolve, time * 1e3, 0 | Math.random() * 1e3));
}

function timeLimit(promise, time) {
  return Promise.race([promise, new Promise((resolve, reject) => {
    setTimeout(reject, time * 1e3, new Error(`Await > ${ time } sec`));
  })]);
}

timeLimit(sleepRandom(5), 10).then(x => console.log(x));           // -> 853, after 5 sec.
timeLimit(sleepRandom(15), 10).catch(error => console.log(error)); // Error: Await > 10 sec
```

## `Promise.allSettled` example
```js
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // -> [{ value: 1, status: 'fulfilled' }, { reason: 2, status: 'rejected' }, { value: 3, status: 'fulfilled' }]
```

## `Promise.any` example
```js
Promise.any([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log); // -> 1

Promise.any([
  Promise.reject(1),
  Promise.reject(2),
  Promise.reject(3),
]).catch(({ errors }) => console.log(errors)); // -> [1, 2, 3]
```

## `Promise.try` examples
```js
Promise.try(() => 42).then(it => console.log(`Promise, resolved as ${ it }`));

Promise.try(() => { throw new Error('42'); }).catch(error => console.log(`Promise, rejected as ${ error }`));

Promise.try(async () => 42).then(it => console.log(`Promise, resolved as ${ it }`));

Promise.try(async () => { throw new Error('42'); }).catch(error => console.log(`Promise, rejected as ${ error }`));

Promise.try(it => it, 42).then(it => console.log(`Promise, resolved as ${ it }`));
```

## `Promise.withResolvers` examples
```js
const d = Promise.withResolvers();
d.resolve(42);
d.promise.then(console.log); // -> 42
```

## Example with async functions
```js
let delay = time => new Promise(resolve => setTimeout(resolve, time));

async function sleepRandom(time) {
  await delay(time * 1e3);
  return 0 | Math.random() * 1e3;
}

async function sleepError(time, msg) {
  await delay(time * 1e3);
  throw new Error(msg);
}

(async () => {
  try {
    console.log('Run');                // => Run
    console.log(await sleepRandom(5)); // => 936, after 5 sec.
    let [a, b, c] = await Promise.all([
      sleepRandom(5),
      sleepRandom(15),
      sleepRandom(10),
    ]);
    console.log(a, b, c);              // => 210 445 71, after 15 sec.
    await sleepError(5, 'Error!');
    console.log('Will not be displayed');
  } catch (error) {
    console.log(error);                // => Error: 'Error!', after 5 sec.
  }
})();
```

## Unhandled rejection tracking

In Node.js, like in native implementation, available events [`unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection) and [`rejectionHandled`](https://nodejs.org/api/process.html#process_event_rejectionhandled):
```ts
process.on('unhandledRejection', (reason, promise) => console.log('unhandled', reason, promise));
process.on('rejectionHandled', promise => console.log('handled', promise));

let promise = Promise.reject(42);
// unhandled 42 [object Promise]

setTimeout(() => promise.catch(() => { /* empty */ }), 1e3);
// handled [object Promise]
```
In a browser on rejection, by default, you will see notify in the console, or you can add a custom handler and a handler on handling unhandled, example:
```js
globalThis.addEventListener('unhandledrejection', e => console.log('unhandled', e.reason, e.promise));
globalThis.addEventListener('rejectionhandled', e => console.log('handled', e.reason, e.promise));
// or
globalThis.onunhandledrejection = e => console.log('unhandled', e.reason, e.promise);
globalThis.onrejectionhandled = e => console.log('handled', e.reason, e.promise);

let promise = Promise.reject(42);
// => unhandled 42 [object Promise]

setTimeout(() => promise.catch(() => { /* empty */ }), 1e3);
// => handled 42 [object Promise]
```
