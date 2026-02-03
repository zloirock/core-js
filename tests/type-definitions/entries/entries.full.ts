import '@core-js/types/full';

const concat = Iterator.concat([1, 2, 3]);

Iterator.zipKeyed({ a: [1, 2], b: [3, 4] });
Iterator.zip([[1, 2, 3], [4, 5, 6]]);

concat.chunks(2);
concat.windows(3);

Promise.all([1, 2, 3]);
Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
});
