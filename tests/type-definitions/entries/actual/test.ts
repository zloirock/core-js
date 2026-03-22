import '@core-js/types/actual';

const concat = Iterator.concat([1, 2, 3]);

structuredClone({ name: 'core-js' });

Iterator.zipKeyed({ a: [1, 2], b: [3, 4] });
Iterator.zip([[1, 2, 3], [4, 5, 6]]);

// @ts-expect-error
concat.chunks(2);
// @ts-expect-error
concat.windows(3);

Promise.all([1, 2, 3]);
// @ts-expect-error
Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
});

// web
const ex = new DOMException('message', 'SyntaxError');
queueMicrotask(() => {});
setImmediate(() => {});

// @ts-expect-error
DOMException();
// @ts-expect-error
queueMicrotask();

// annex-b
declare const obj: Object;
const proto: object | null = obj.__proto__;
obj.__defineGetter__('x', () => 42);

// @ts-expect-error
obj.__defineGetter__();
