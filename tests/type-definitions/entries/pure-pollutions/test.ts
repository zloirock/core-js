import '@core-js/types/pure';

// no global pollution
// @ts-expect-error
Iterator.chunks(num, 2);
// @ts-expect-error
Iterator.zipKeyed({ a: [1, 2], b: [3, 4] });
// @ts-expect-error
Iterator.zip([[1, 2, 3], [4, 5, 6]]);
// @ts-expect-error
Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
});
