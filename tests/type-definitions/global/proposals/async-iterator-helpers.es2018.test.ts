import 'core-js/full';

const aitn = AsyncIterator.from([1]);
for await (const v of aitn) {}

const ait1 = aitn.filter((v: number, i: number) => v > 0);
for await (const v of ait1) {}

const ait2 = aitn.flatMap((v: number, i: number) => `${ v }`);
for await (const v of ait2) {}

const ait3 = aitn.map((v: number, i: number) => v * 2);
for await (const v of ait3) {}

const ait4 = aitn.take(10);
for await (const v of ait4) {}

const ait5 = aitn.drop(3);
for await (const v of ait5) {}

declare const itn: Iterator<number>;
const ait6 = itn.toAsync();
for await (const v of ait6) {}
