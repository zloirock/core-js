import 'core-js/full';

const p1 = Promise.resolve(42);
const pf1: Promise<number> = p1.finally();
const pf2: Promise<number> = p1.finally(undefined);
const pf3: Promise<number> = p1.finally(null);
const pf4: Promise<number> = p1.finally(() => {});
const pf5: Promise<number> = p1.finally(function () {});

const p2 = Promise.reject("err");
const pf6: Promise<string> = p2.finally();
const pf7: Promise<string> = p2.finally(() => {});

declare function returnsPromise<T>(): Promise<T>;
const genericF: Promise<boolean> = returnsPromise<boolean>().finally(() => {});

// @ts-expect-error
p1.finally(123);

// @ts-expect-error
p1.finally("foo");

// @ts-expect-error
p1.finally({});

// @ts-expect-error
p1.finally([]);

// @ts-expect-error
p1.finally(() => {}, "extra");

// @ts-expect-error
p1.finally(true);

// @ts-expect-error
p1.finally(Symbol("x"));
