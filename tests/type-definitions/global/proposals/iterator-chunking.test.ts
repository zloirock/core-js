import 'core-js/full';

declare function getNumberIterator(): Iterator<number>;

const numbersIter = getNumberIterator();

const chunks: Iterator<number[]> = numbersIter.chunks(2);
const windows: Iterator<number[]> = numbersIter.windows(4);

const chunkNext = chunks.next();
const windowsNext = windows.next();

// @ts-expect-error
numbersIter.chunks();
// @ts-expect-error
numbersIter.chunks('2');
// @ts-expect-error
numbersIter.chunks(2, 3);

// @ts-expect-error
numbersIter.windows();
// @ts-expect-error
numbersIter.windows({});
// @ts-expect-error
numbersIter.windows(4, 1);
