import 'core-js/full';

declare function getNumberIterator(): Iterator<number>;

const numbersIter = getNumberIterator();

const chunks: IteratorObject<number[]> = numbersIter.chunks(2);
const sliding: IteratorObject<number[]> = numbersIter.sliding(3);
const windows: IteratorObject<number[]> = numbersIter.windows(4);

const chunkNext = chunks.next();
const slidingNext = sliding.next();
const windowsNext = windows.next();

// @ts-expect-error
numbersIter.chunks();
// @ts-expect-error
numbersIter.chunks("2");
// @ts-expect-error
numbersIter.chunks(2, 3);

// @ts-expect-error
numbersIter.sliding();
// @ts-expect-error
numbersIter.sliding(true);
// @ts-expect-error
numbersIter.sliding(2, 3);

// @ts-expect-error
numbersIter.windows();
// @ts-expect-error
numbersIter.windows({});
// @ts-expect-error
numbersIter.windows(4, 1);
