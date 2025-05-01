Array.fromAsync([1, 2, 3]);
Array.fromAsync([Promise.resolve(1), 2, 3]);
Array.fromAsync((async function* () { yield 1; })());
Array.fromAsync([1, 2, 3], (value: number, index: number) => value.toString());
Array.fromAsync([Promise.resolve(1), 2, 3], (value: number) => value + 1);
Array.fromAsync((async function* () { yield 1; })(), function (value: number) { return value * 2; });
Array.fromAsync([1, 2, 3], function (this: {foo: string}, value: number) { return value.toString(); }, {foo: 'str'});

async function t1() {
  const n: number[] = await Array.fromAsync([1, 2, 3]);
  const m: number[] = await Array.fromAsync([Promise.resolve(1), 2, 3]);
  const s: string[] = await Array.fromAsync([1, 2, 3], (value: number) => value.toString());
}

async function t2() {
  const bar: number[] = await Array.fromAsync([1, 2, 3], async (v: number) => v + 1);
  const foo: string[] = await Array.fromAsync([Promise.resolve(1), 2], async (v: number) => String(v));
}

declare const arrLike: { [index: number]: PromiseLike<number>; length: 2 };
Array.fromAsync(arrLike);
Array.fromAsync(arrLike, (value: number) => value);

// @ts-expect-error
Array.fromAsync([1, 2, 3], (value: string) => value);
// @ts-expect-error
Array.fromAsync([1, 2, 3], (value: string) => 1);
// @ts-expect-error
Array.fromAsync(['a', 'b', 'c'], (value: number) => value);
// @ts-expect-error
Array.fromAsync([Promise.resolve(1), 2, 3], (value: string) => value);
// @ts-expect-error
Array.fromAsync((async function* () { yield 'a'; })(), (value: number) => value);

declare const strArrLike: { [index: number]: string; length: 3 };
// @ts-expect-error
Array.fromAsync(strArrLike, (value: number) => value);