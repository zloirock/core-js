import '@core-js/types/stable';

const concat = Iterator.concat([1, 2, 3]);

structuredClone({ name: 'core-js' });

// @ts-expect-error
Iterator.zipKeyed({ a: [1, 2], b: [3, 4] });
// @ts-expect-error
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
// @ts-expect-error
queueMicrotask('not a function');

// annex-b
declare const obj: Object;
const proto: object | null = obj.__proto__;
obj.__defineGetter__('x', () => 42);
obj.__defineSetter__('x', (v: number) => {});

// @ts-expect-error
obj.__defineGetter__();
