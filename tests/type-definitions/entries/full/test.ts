import '@core-js/types/full';

const concat = Iterator.concat([1, 2, 3]);

structuredClone({ name: 'core-js' });

Iterator.zipKeyed({ a: [1, 2], b: [3, 4] });
Iterator.zip([[1, 2, 3], [4, 5, 6]]);

concat.chunks(2);
concat.windows(3);

Promise.all([1, 2, 3]);
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
const g: (() => any) | undefined = obj.__lookupGetter__('x');
const s: ((v: any) => void) | undefined = obj.__lookupSetter__('x');

// @ts-expect-error
obj.__defineGetter__();
// @ts-expect-error
obj.__lookupGetter__();
