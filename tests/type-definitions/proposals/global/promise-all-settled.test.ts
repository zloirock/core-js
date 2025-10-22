import 'core-js/full';

const promises = [Promise.resolve(1), Promise.resolve("foo"), 3] as const;
const arr = [Promise.resolve(1), Promise.resolve(2)];
const strArr = ["a", "b", "c"];
const promiseLike = { then: (cb: (val: number) => void) => cb(42) };

const settled1: Promise<[
  PromiseSettledResult<number>,
  PromiseSettledResult<string>,
  PromiseSettledResult<number>
]> = Promise.allSettled(promises);

const settled2: Promise<PromiseSettledResult<number>[]> = Promise.allSettled([Promise.resolve(10), Promise.resolve(20), 30]);
const settled3: Promise<PromiseSettledResult<string>[]> = Promise.allSettled(strArr);
const settled4: Promise<PromiseSettledResult<number>[]> = Promise.allSettled(new Set([1, 2, 3]));
const settled5: Promise<PromiseSettledResult<number>[]> = Promise.allSettled([promiseLike]);

const emptyTuple: [] = [];
const settled6: Promise<[]> = Promise.allSettled(emptyTuple);

const mixedTuple = [42, Promise.resolve("bar")] as const;
const settled7: Promise<[
  PromiseSettledResult<number>,
  PromiseSettledResult<string>
]> = Promise.allSettled(mixedTuple);

// @ts-expect-error
Promise.allSettled();

// @ts-expect-error
Promise.allSettled(5);

// @ts-expect-error
Promise.allSettled({ foo: 123 });

// @ts-expect-error
Promise.allSettled([1, 2], 123);

// @ts-expect-error
Promise.allSettled([Promise.resolve(1)], "extra");
