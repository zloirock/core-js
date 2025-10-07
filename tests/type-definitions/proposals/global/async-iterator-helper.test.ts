import 'core-js/full';

AsyncIterator.from([1, 2, 3]);
AsyncIterator.from(new Set([1, 2, 3]));
AsyncIterator.from((async function* () { yield 1; yield 2; })());
AsyncIterator.from((function* () { yield 3; })());
AsyncIterator.from('abc');

declare const ain: AsyncIteratorObject<number>;
declare const aio: AsyncIteratorObject<{ x: number }>;
declare const ais: AsyncIteratorObject<string>;
declare const ilb: Iterable<boolean>;
declare const is: Iterator<string>;
declare const itn: Iterator<number>;
declare const ailb: AsyncIterable<boolean>;
async function* ag(): AsyncIterable<string> { yield 'foo'; }

AsyncIterator.from(ain);
AsyncIterator.from(ag());
AsyncIterator.from(ilb);
AsyncIterator.from(ailb);
AsyncIterator.from(aio);

// @ts-expect-error
AsyncIterator.from(123);
// @ts-expect-error
AsyncIterator.from({});
// @ts-expect-error
AsyncIterator.from();
// @ts-expect-error
AsyncIterator.from({ next: () => 1 });

const raits: AsyncIterator<string> = is.toAsync();
const raitn: AsyncIterator<number> = itn.toAsync();

const r1: AsyncIterator<number> = ain.drop(3);
const r2: Promise<boolean> = ain.every((v: number, i: number) => v > 0);
const r3: AsyncIterator<number> = ain.filter((v: number, i: number) => v > 0);
const r4: Promise<number> = ain.find((v: number, i: number) => v > 0);
const r5: AsyncIterator<string> = ain.flatMap((v: number, i: number) => `${v}`);
const r6: Promise<void> = ain.forEach((v: number, i: number) => { });
const r7: AsyncIterator<number> = ain.map((v: number, i: number) => v * 2);
const r8: Promise<number> = ain.reduce((acc: number, v: number, i: number) => acc + v, 0);
const r9: Promise<boolean> = ain.some((v: number, i: number) => v > 0);
const r10: AsyncIterator<number> = ain.take(10);
const r11: Promise<number[]> = ain.toArray();

// @ts-expect-error
ain.drop();
// @ts-expect-error
ain.every();
// @ts-expect-error
ain.filter();
// @ts-expect-error
ain.find();
// @ts-expect-error
ain.flatMap();
// @ts-expect-error
ain.forEach();
// @ts-expect-error
ain.map();
// @ts-expect-error
ain.reduce();
// @ts-expect-error
ain.some();
// @ts-expect-error
ain.take();
// @ts-expect-error
ain.toArray(1);

const s0: Promise<string[]> = ais.toArray();
const f0: Promise<string> = ais.find((v: string, i: number) => v.length === 1);

// @ts-expect-error
ais.map((v: string, i: number) => v.length === 1, 'extra');
