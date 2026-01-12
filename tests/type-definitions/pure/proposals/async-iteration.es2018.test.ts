import $Symbol from '@core-js/pure/full/symbol/index';

async function * makeAsyncIterable() {
  yield 1;
  yield 2;
}

for await (const x of {
  [$Symbol.asyncIterator]: makeAsyncIterable,
}) {
  const n: number = x;
}
