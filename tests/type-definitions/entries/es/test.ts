import '@core-js/types/es';

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

// annex-b (included in es)
declare const obj: Object;
const proto: object | null = obj.__proto__;
obj.__defineGetter__('x', () => 42);

// @ts-expect-error
obj.__defineGetter__();
