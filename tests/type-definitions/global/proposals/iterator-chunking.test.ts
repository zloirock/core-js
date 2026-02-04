import 'core-js/full';
import chunks from 'core-js/full/iterator/chunks';
import windows from 'core-js/full/iterator/windows';

declare function getNumberIterator(): Iterator<number>;

const numbersIter = getNumberIterator();

const res1: Iterator<number[]> = chunks(numbersIter, 2);
const res2: Iterator<number[]> = windows(numbersIter, 4);

// @ts-expect-error
chunks();
// @ts-expect-error
windows();

const res3: Iterator<number[]> = numbersIter.chunks(2);
const res4: Iterator<number[]> = numbersIter.windows(4);

const chunkNext = res1.next();
const windowsNext = res2.next();

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
