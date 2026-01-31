import 'core-js/full';

const promises = [Promise.resolve(1), Promise.resolve('foo'), 3] as const;
const arr = [Promise.resolve(1), Promise.resolve(2)];
const strArr = ['a', 'b', 'c'];
const promiseLike = { then: (cb: (val: number) => void) => cb(42) };

interface CoreJSPromiseResult<T> {
  status: string;
  value?: T;
  reason?: any;
}

const settled1: Promise<[
  CoreJSPromiseResult<number>,
  CoreJSPromiseResult<string>,
  CoreJSPromiseResult<number>,
]> = Promise.allSettled(promises);

const settled2: Promise<CoreJSPromiseResult<number>[]> = Promise.allSettled([Promise.resolve(10), Promise.resolve(20), 30]);
const settled3: Promise<CoreJSPromiseResult<string>[]> = Promise.allSettled(strArr);
const settled4: Promise<CoreJSPromiseResult<number>[]> = Promise.allSettled(new Set([1, 2, 3]));
const settled5: Promise<CoreJSPromiseResult<number>[]> = Promise.allSettled([promiseLike]);

const emptyTuple: [] = [];
const settled6: Promise<[]> = Promise.allSettled(emptyTuple);

const mixedTuple = [42, Promise.resolve('bar')] as const;
const settled7: Promise<[
  CoreJSPromiseResult<number>,
  CoreJSPromiseResult<string>,
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
Promise.allSettled([Promise.resolve(1)], 'extra');
